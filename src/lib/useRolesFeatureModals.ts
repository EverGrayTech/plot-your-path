"use client";

import { useEffect, useState } from "react";

import type {
  DesirabilityFactor,
  InterviewStage,
  OutcomeInsights,
  OutcomeTuningSuggestions,
  PipelineCounters,
  PipelineItem,
} from "./dataModels";
import { getFrontendServices } from "./services";

export type StageFilter = "all" | InterviewStage;

const EMPTY_PIPELINE_COUNTERS: PipelineCounters = {
  needs_follow_up: 0,
  overdue_actions: 0,
  upcoming_deadlines: 0,
};

export function useRolesFeatureModals() {
  const [showFactorSettings, setShowFactorSettings] = useState(false);
  const [showPipeline, setShowPipeline] = useState(false);
  const [showOutcomeInsights, setShowOutcomeInsights] = useState(false);

  const [factors, setFactors] = useState<DesirabilityFactor[]>([]);
  const [factorsLoading, setFactorsLoading] = useState(false);
  const [factorsError, setFactorsError] = useState<string | null>(null);
  const [newFactorName, setNewFactorName] = useState("");
  const [newFactorPrompt, setNewFactorPrompt] = useState("");
  const [newFactorWeight, setNewFactorWeight] = useState("0.10");

  const [pipelineItems, setPipelineItems] = useState<PipelineItem[]>([]);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [pipelineCounters, setPipelineCounters] = useState(EMPTY_PIPELINE_COUNTERS);
  const [pipelineOverdueOnly, setPipelineOverdueOnly] = useState(false);
  const [pipelineWeekDeadlines, setPipelineWeekDeadlines] = useState(false);
  const [pipelineRecentlyUpdated, setPipelineRecentlyUpdated] = useState(false);
  const [pipelineStageFilter, setPipelineStageFilter] = useState<StageFilter>("all");

  const [outcomeInsights, setOutcomeInsights] = useState<OutcomeInsights | null>(null);
  const [outcomeInsightsLoading, setOutcomeInsightsLoading] = useState(false);
  const [outcomeInsightsError, setOutcomeInsightsError] = useState<string | null>(null);
  const [tuningSuggestions, setTuningSuggestions] = useState<OutcomeTuningSuggestions | null>(null);

  useEffect(() => {
    if (!showPipeline) {
      return;
    }

    const fetchPipeline = async () => {
      setPipelineLoading(true);
      setPipelineError(null);
      try {
        const response = await getFrontendServices().workflows.listPipeline({
          overdueOnly: pipelineOverdueOnly,
          recentlyUpdated: pipelineRecentlyUpdated,
          thisWeekDeadlines: pipelineWeekDeadlines,
        });
        setPipelineItems(response.items);
        setPipelineCounters(response.counters);
      } catch (error) {
        setPipelineError(error instanceof Error ? error.message : "Failed to load pipeline.");
      } finally {
        setPipelineLoading(false);
      }
    };

    void fetchPipeline();
  }, [pipelineOverdueOnly, pipelineRecentlyUpdated, pipelineWeekDeadlines, showPipeline]);

  const loadFactors = async () => {
    setFactorsLoading(true);
    setFactorsError(null);
    try {
      setFactors(await getFrontendServices().desirabilityFactors.listDesirabilityFactors());
    } catch (error) {
      setFactorsError(error instanceof Error ? error.message : "Failed to load factors.");
    } finally {
      setFactorsLoading(false);
    }
  };

  const fetchOutcomeInsights = async () => {
    setOutcomeInsightsLoading(true);
    setOutcomeInsightsError(null);
    try {
      const [insights, suggestions] = await Promise.all([
        getFrontendServices().workflows.getOutcomeInsights(),
        getFrontendServices().workflows.getOutcomeTuningSuggestions(),
      ]);
      setOutcomeInsights(insights);
      setTuningSuggestions(suggestions);
    } catch (error) {
      setOutcomeInsightsError(
        error instanceof Error ? error.message : "Failed to load outcome insights.",
      );
    } finally {
      setOutcomeInsightsLoading(false);
    }
  };

  const openFactorSettings = () => {
    setShowFactorSettings(true);
    void loadFactors();
  };

  const closeFactorSettings = () => {
    setShowFactorSettings(false);
    setFactorsError(null);
  };

  const openPipeline = () => {
    setShowPipeline(true);
  };

  const closePipeline = () => {
    setShowPipeline(false);
    setPipelineError(null);
  };

  const openOutcomeInsights = () => {
    setShowOutcomeInsights(true);
    void fetchOutcomeInsights();
  };

  const closeOutcomeInsights = () => {
    setShowOutcomeInsights(false);
    setOutcomeInsightsError(null);
  };

  const handleAddFactor = async () => {
    const parsedWeight = Number(newFactorWeight);
    if (!newFactorName.trim() || !newFactorPrompt.trim() || Number.isNaN(parsedWeight)) {
      setFactorsError("Provide name, prompt, and numeric weight.");
      return;
    }

    try {
      await getFrontendServices().desirabilityFactors.createDesirabilityFactor({
        display_order: factors.length,
        is_active: true,
        name: newFactorName.trim(),
        prompt: newFactorPrompt.trim(),
        weight: parsedWeight,
      });
      setNewFactorName("");
      setNewFactorPrompt("");
      setNewFactorWeight("0.10");
      await loadFactors();
    } catch (error) {
      setFactorsError(error instanceof Error ? error.message : "Failed to create factor.");
    }
  };

  const handleDeleteFactor = async (factorId: number) => {
    try {
      await getFrontendServices().desirabilityFactors.deleteDesirabilityFactor(factorId);
      const ordered = factors.filter((factor) => factor.id !== factorId).map((factor) => factor.id);
      if (ordered.length) {
        await getFrontendServices().desirabilityFactors.reorderDesirabilityFactors(ordered);
      }
      await loadFactors();
    } catch (error) {
      setFactorsError(error instanceof Error ? error.message : "Failed to delete factor.");
    }
  };

  const handleMoveFactor = async (factorId: number, direction: -1 | 1) => {
    const index = factors.findIndex((factor) => factor.id === factorId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= factors.length) {
      return;
    }

    const reordered = [...factors];
    const [item] = reordered.splice(index, 1);
    reordered.splice(nextIndex, 0, item);

    try {
      setFactors(
        await getFrontendServices().desirabilityFactors.reorderDesirabilityFactors(
          reordered.map((factor) => factor.id),
        ),
      );
    } catch (error) {
      setFactorsError(error instanceof Error ? error.message : "Failed to reorder factors.");
    }
  };

  const handleUpdateFactor = async (
    factorId: number,
    field: "is_active" | "prompt" | "weight",
    value: boolean | number | string,
  ) => {
    try {
      if (field === "is_active") {
        await getFrontendServices().desirabilityFactors.updateDesirabilityFactor(factorId, {
          is_active: Boolean(value),
        });
      }
      if (field === "prompt") {
        await getFrontendServices().desirabilityFactors.updateDesirabilityFactor(factorId, {
          prompt: String(value),
        });
      }
      if (field === "weight") {
        await getFrontendServices().desirabilityFactors.updateDesirabilityFactor(factorId, {
          weight: Number(value),
        });
      }
      await loadFactors();
    } catch (error) {
      setFactorsError(error instanceof Error ? error.message : "Failed to update factor.");
    }
  };

  return {
    closeFactorSettings,
    closeOutcomeInsights,
    closePipeline,
    factors,
    factorsError,
    factorsLoading,
    handleAddFactor,
    handleDeleteFactor,
    handleMoveFactor,
    handleUpdateFactor,
    newFactorName,
    newFactorPrompt,
    newFactorWeight,
    openFactorSettings,
    openOutcomeInsights,
    openPipeline,
    outcomeInsights,
    outcomeInsightsError,
    outcomeInsightsLoading,
    pipelineCounters,
    pipelineError,
    pipelineItems,
    pipelineLoading,
    pipelineOverdueOnly,
    pipelineRecentlyUpdated,
    pipelineStageFilter,
    pipelineWeekDeadlines,
    setNewFactorName,
    setNewFactorPrompt,
    setNewFactorWeight,
    setPipelineOverdueOnly,
    setPipelineRecentlyUpdated,
    setPipelineStageFilter,
    setPipelineWeekDeadlines,
    showFactorSettings,
    showOutcomeInsights,
    showPipeline,
    tuningSuggestions,
  };
}
