"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import styles from "./ProfileHeader.module.scss";
import Button from "@/components/Button/Button";

type Props = {
  displayName: string;
  username: string;
  avatarUrl?: string | null; // later
};

export default function ProfileHeader({
  displayName,
  username,
  avatarUrl,
}: Props) {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = `${displayName} (@${username})`;

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }
    } catch {
      // ignored
    }
  }, [displayName, username]);

  return (
    <header className={styles.header}>
      <div className={styles.avatarWrap} aria-hidden={!avatarUrl}>
        {avatarUrl ? (
          // swap to next/image later
          <img
            src={avatarUrl}
            className={styles.avatar}
            alt={`${displayName} avatar`}
          />
        ) : (
          <div className={styles.avatarPlaceholder} />
        )}
      </div>

      <div className={styles.text}>
        <h1 className={styles.displayName}>{displayName}</h1>
        <p className={styles.username}>@{username}</p>
      </div>

      <div className={styles.actions}>
        <Button onClick={share}>{copied ? "Copied!" : "Share"}</Button>

        <Link href="/settings">
          <Button>Settings</Button>
        </Link>
      </div>
    </header>
  );
}
