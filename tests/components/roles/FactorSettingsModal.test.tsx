import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { FactorSettingsModal } from "../../../src/components/roles/FactorSettingsModal";

describe("FactorSettingsModal", () => {
  it("renders loading and error states", () => {
    render(
      <FactorSettingsModal
        error="Failed to load"
        factors={[]}
        loading
        newFactorName=""
        newFactorPrompt=""
        newFactorWeight="0.10"
        onAddFactor={vi.fn()}
        onClose={vi.fn()}
        onDeleteFactor={vi.fn()}
        onMoveFactor={vi.fn()}
        onSetNewFactorName={vi.fn()}
        onSetNewFactorPrompt={vi.fn()}
        onSetNewFactorWeight={vi.fn()}
        onUpdateFactor={vi.fn()}
      />,
    );

    expect(screen.getByText(/Loading factors/i)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Failed to load");
  });

  it("updates, reorders, deletes, and adds factors", () => {
    const onUpdateFactor = vi.fn();
    const onMoveFactor = vi.fn();
    const onDeleteFactor = vi.fn();
    const onSetNewFactorName = vi.fn();
    const onSetNewFactorPrompt = vi.fn();
    const onSetNewFactorWeight = vi.fn();
    const onAddFactor = vi.fn();

    render(
      <FactorSettingsModal
        error={null}
        factors={[
          {
            id: 1,
            name: "Growth",
            prompt: "Growth prompt",
            weight: 0.4,
            is_active: true,
            display_order: 0,
            created_at: "2026-03-18T00:00:00.000Z",
            updated_at: "2026-03-18T00:00:00.000Z",
          },
          {
            id: 2,
            name: "Compensation",
            prompt: "Comp prompt",
            weight: 0.3,
            is_active: false,
            display_order: 1,
            created_at: "2026-03-18T00:00:00.000Z",
            updated_at: "2026-03-18T00:00:00.000Z",
          },
        ]}
        loading={false}
        newFactorName="New"
        newFactorPrompt="Prompt"
        newFactorWeight="0.25"
        onAddFactor={onAddFactor}
        onClose={vi.fn()}
        onDeleteFactor={onDeleteFactor}
        onMoveFactor={onMoveFactor}
        onSetNewFactorName={onSetNewFactorName}
        onSetNewFactorPrompt={onSetNewFactorPrompt}
        onSetNewFactorWeight={onSetNewFactorWeight}
        onUpdateFactor={onUpdateFactor}
      />,
    );

    fireEvent.blur(screen.getByDisplayValue("Growth prompt"), {
      target: { value: "Updated prompt" },
    });
    fireEvent.blur(screen.getByDisplayValue("0.4"), { target: { value: "0.5" } });
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.click(screen.getAllByRole("button", { name: /Move down/i })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: /Delete/i })[0]);

    fireEvent.change(screen.getByDisplayValue("New"), { target: { value: "Updated New" } });
    fireEvent.change(screen.getByDisplayValue("Prompt"), { target: { value: "Updated Prompt" } });
    fireEvent.change(screen.getByDisplayValue("0.25"), { target: { value: "0.9" } });
    fireEvent.click(screen.getByRole("button", { name: /Add factor/i }));

    expect(onUpdateFactor).toHaveBeenCalledWith(1, "prompt", "Updated prompt");
    expect(onUpdateFactor).toHaveBeenCalledWith(1, "weight", 0.5);
    expect(onUpdateFactor).toHaveBeenCalledWith(1, "is_active", false);
    expect(onMoveFactor).toHaveBeenCalledWith(1, 1);
    expect(onDeleteFactor).toHaveBeenCalledWith(1);
    expect(onSetNewFactorName).toHaveBeenCalledWith("Updated New");
    expect(onSetNewFactorPrompt).toHaveBeenCalledWith("Updated Prompt");
    expect(onSetNewFactorWeight).toHaveBeenCalledWith("0.9");
    expect(onAddFactor).toHaveBeenCalled();
  });
});
