"use client";

import { useEffect } from "react";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import AccentButton from "@/components/AccentButton/AccentButton";
import styles from "./StepsInput.module.scss";

type Step = {
  step_no: number;
  body: string;
};

type Props = {
  steps: Step[];
  onChange: (steps: Step[]) => void;
};

export default function StepsInput({ steps, onChange }: Props) {
  // Add one blank step by default
  useEffect(() => {
    if (steps.length === 0) {
      onChange([{ step_no: 1, body: "" }]);
    }
  }, [steps.length, onChange]);

  const addStep = () => {
    const nextStepNo = steps.length > 0 ? Math.max(...steps.map(s => s.step_no)) + 1 : 1;
    const newStep: Step = {
      step_no: nextStepNo,
      body: "",
    };
    onChange([...steps, newStep]);
  };

  const removeStep = (stepNo: number) => {
    const filtered = steps.filter(s => s.step_no !== stepNo);
    // Renumber the remaining steps to be consecutive
    const renumbered = filtered.map((step, index) => ({
      ...step,
      step_no: index + 1,
    }));
    onChange(renumbered);
  };

  const updateStepBody = (stepNo: number, body: string) => {
    const updated = steps.map(step =>
      step.step_no === stepNo ? { ...step, body } : step
    );
    onChange(updated);
  };

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Steps</h3>

      {steps.map((step) => (
        <div key={step.step_no} className={styles.rowBlock}>
          <div className={styles.row}>
            <div className={styles.stepNumber}>
              {step.step_no}
            </div>
            <Input
              value={step.body}
              onChange={(value) => updateStepBody(step.step_no, value)}
              placeholder="Step details"
            />
          </div>
          <div className={styles.rowActions}>
            <Button
              type="button"
              onClick={() => removeStep(step.step_no)}
            >
              - remove step
            </Button>
          </div>
        </div>
      ))}

      <div className={styles.actions}>
        <AccentButton type="button" onClick={addStep}>
          + add step
        </AccentButton>
      </div>
    </div>
  );
}