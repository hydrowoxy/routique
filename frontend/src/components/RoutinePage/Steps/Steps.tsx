import styles from "./Steps.module.scss";

type Step = { 
  step_no: number; 
  body: string; 
};

type Props = {
  steps: Step[] | null;
};

export default function Steps({ steps }: Props) {
  if (!steps || steps.length === 0) return null;

  return (
    <section className={styles.steps}>
      <h2 className={styles.title}>Steps</h2>

      <div className={styles.stepsList}>
        {steps.map((step) => (
          <div key={step.step_no} className={styles.stepRow}>
            <div className={styles.stepNumber}>
              {step.step_no}
            </div>
            <div className={styles.stepBody}>
              {step.body}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}