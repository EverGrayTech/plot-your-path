import { fireEvent, render, screen } from "@testing-library/react";

import { DesirabilityFactorsSettingsClient } from "../../../src/components/settings/DesirabilityFactorsSettingsClient";

const useRolesFeatureModalsMock = vi.fn();

vi.mock("../../../src/lib/useRolesFeatureModals", () => ({
  useRolesFeatureModals: () => useRolesFeatureModalsMock(),
}));

describe("DesirabilityFactorsSettingsClient", () => {
  it("renders the ai-config-aligned skeleton and loads factors once", () => {
    const loadFactors = vi.fn();

    useRolesFeatureModalsMock.mockReturnValue({
      loadFactors,
      factors: [],
      factorsError: null,
      factorsLoading: false,
      handleAddFactor: vi.fn(),
      handleDeleteFactor: vi.fn(),
      handleMoveFactor: vi.fn(),
      handleUpdateFactor: vi.fn(),
      newFactorName: "",
      newFactorPrompt: "",
      newFactorWeight: "0.10",
      setNewFactorName: vi.fn(),
      setNewFactorPrompt: vi.fn(),
      setNewFactorWeight: vi.fn(),
    });

    render(<DesirabilityFactorsSettingsClient />);

    expect(screen.getByRole("heading", { name: /Desirability Factors/i })).toBeInTheDocument();
    expect(screen.getAllByText(/^Add Factor$/i).length).toBeGreaterThan(0);
    expect(loadFactors).toHaveBeenCalledTimes(1);
  });

  it("renders details-based factor sections and wires factor management actions", () => {
    const handleAddFactor = vi.fn();
    const handleDeleteFactor = vi.fn();
    const handleMoveFactor = vi.fn();
    const handleUpdateFactor = vi.fn();
    const loadFactors = vi.fn();
    const setNewFactorName = vi.fn();
    const setNewFactorPrompt = vi.fn();
    const setNewFactorWeight = vi.fn();

    useRolesFeatureModalsMock.mockReturnValue({
      loadFactors,
      factors: [
        {
          created_at: "2026-01-01T00:00:00Z",
          display_order: 0,
          id: 4,
          is_active: true,
          name: "Growth",
          prompt: "Evaluate growth opportunity.",
          updated_at: "2026-01-02T00:00:00Z",
          weight: 0.25,
        },
      ],
      factorsError: null,
      factorsLoading: false,
      handleAddFactor,
      handleDeleteFactor,
      handleMoveFactor,
      handleUpdateFactor,
      newFactorName: "",
      newFactorPrompt: "",
      newFactorWeight: "0.10",
      setNewFactorName,
      setNewFactorPrompt,
      setNewFactorWeight,
    });

    render(<DesirabilityFactorsSettingsClient />);

    fireEvent.click(screen.getByText(/^Growth$/i));
    fireEvent.blur(screen.getAllByLabelText("Prompt")[0], {
      target: { value: "Updated prompt" },
    });
    fireEvent.blur(screen.getAllByLabelText("Weight")[0], {
      target: { value: "0.50" },
    });
    fireEvent.click(screen.getByLabelText("Enable factor"));
    fireEvent.click(screen.getByRole("button", { name: /Delete factor/i }));
    fireEvent.click(screen.getAllByText(/^Add Factor$/i)[0]);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Name" } });
    fireEvent.change(screen.getAllByLabelText("Weight")[1], { target: { value: "0.25" } });
    fireEvent.change(screen.getAllByLabelText("Prompt")[1], { target: { value: "Prompt" } });
    fireEvent.click(screen.getByRole("button", { name: /^Add factor$/i }));

    expect(loadFactors).toHaveBeenCalledTimes(1);
    expect(handleAddFactor).toHaveBeenCalled();
    expect(handleDeleteFactor).toHaveBeenCalledWith(4);
    expect(handleUpdateFactor).toHaveBeenCalledWith(4, "prompt", "Updated prompt");
    expect(handleUpdateFactor).toHaveBeenCalledWith(4, "weight", "0.50");
    expect(handleUpdateFactor).toHaveBeenCalledWith(4, "is_active", expect.any(Boolean));
    expect(setNewFactorName).toHaveBeenCalledWith("Name");
    expect(setNewFactorPrompt).toHaveBeenCalledWith("Prompt");
    expect(setNewFactorWeight).toHaveBeenCalledWith("0.25");
    expect(screen.getByText(/Weight 0.25/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Enable factor")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Move up/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Move down/i })).not.toBeInTheDocument();
  });

  it("renders a minimal empty state when no factors exist", () => {
    const loadFactors = vi.fn();

    useRolesFeatureModalsMock.mockReturnValue({
      loadFactors,
      factors: [],
      factorsError: null,
      factorsLoading: false,
      handleAddFactor: vi.fn(),
      handleDeleteFactor: vi.fn(),
      handleMoveFactor: vi.fn(),
      handleUpdateFactor: vi.fn(),
      newFactorName: "",
      newFactorPrompt: "",
      newFactorWeight: "0.10",
      setNewFactorName: vi.fn(),
      setNewFactorPrompt: vi.fn(),
      setNewFactorWeight: vi.fn(),
    });

    render(<DesirabilityFactorsSettingsClient />);

    expect(screen.getByText(/No factors configured/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Add a factor to start shaping desirability scoring/i),
    ).toBeInTheDocument();
  });
});
