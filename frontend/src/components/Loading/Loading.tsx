import styles from "./Loading.module.scss";

export default function Loading() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.loader}>
        <div className={styles.circle}></div>
      </div>
      <p className={styles.text}>Loading...</p>
      <p className={styles.subtext}>
        If you are not redirected in a few seconds, please refresh.
      </p>
    </div>
  );
}
