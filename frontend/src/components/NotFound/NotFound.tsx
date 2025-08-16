import Link from "next/link";
import AccentButton from "@/components/AccentButton/AccentButton";
import styles from "./NotFound.module.scss";

export default function NotFound() {
  return (
    <main className={styles.wrapper}>

      <section className={styles.center}>
        <h1 className={styles.code}>404</h1>
        <p className={styles.headline}>This isn’t the look we were going for...</p>
        <p className={styles.subtext}>Let’s take you back somewhere cute.</p>

        <Link href="/" className={styles.linkReset}>
          <AccentButton>Return to home</AccentButton>
        </Link>
      </section>
    </main>
  );
}
