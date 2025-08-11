'use client';

import styles from "./RoutineGrid.module.scss";
import RoutineCard from "@/components/RoutineCard/RoutineCard";
import NothingHere from "@/components/NothingHere/NothingHere";

type RoutineForGrid = {
  id: string;
  title: string;
  description: string | null;
  image_path: string | null;
  favourite_count: number;
  view_count: number;
  user_id: string;
  category: string | null;
  profiles?: { username: string | null } | null;
};

export default function RoutineGrid({
  routines,
  showUsername = true,
  usernameOverride,
}: {
  routines: RoutineForGrid[];
  showUsername?: boolean;
  usernameOverride?: string | null;
}) {
  if (!routines.length) return <NothingHere message="Oops! Empty shelf…" />;

  return (
    <div className={styles.grid}>
      {routines.map((r) => (
        <RoutineCard
          key={r.id}
          routine={{
            id: r.id,
            title: r.title,
            user_id: r.user_id,
            image_path: r.image_path ?? null,
            category: r.category ?? null,
          }}
          username={usernameOverride ?? r.profiles?.username ?? null}
          showUsername={showUsername}
        />
      ))}
    </div>
  );
}
