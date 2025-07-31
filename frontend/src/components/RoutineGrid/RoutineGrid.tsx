"use client";

import styles from "./RoutineGrid.module.scss";
import RoutineCard from "@/components/RoutineCard/RoutineCard";
import type { Database } from "@/lib/database.types";

type Routine = Pick<
  Database["public"]["Tables"]["routines"]["Row"],
  "id" | "title" | "description" | "image_path" | "favourite_count" | "view_count" | "user_id" | "category"
>;

export default function RoutineGrid({ routines }: { routines: Routine[] }) {
  if (routines.length === 0) {
    return <p>No routines found.</p>;
  }

  return (
    <div className={styles.grid}>
      {routines.map((routine) => (
        <RoutineCard key={routine.id} routine={routine} />
      ))}
    </div>
  );
}
