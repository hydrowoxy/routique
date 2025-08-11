"use client";

import styles from "./RoutineGrid.module.scss";
import RoutineCard from "@/components/RoutineCard/RoutineCard";
import NothingHere from "@/components/NothingHere/NothingHere";


type RoutineWithProfile = {
  id: string;
  title: string;
  description: string;
  image_path: string;
  favourite_count: number;
  view_count: number;
  user_id: string;
  category: string;
  profiles?: { username: string } | null;
};

export default function RoutineGrid({
  routines,
  showUsernames = true,
}: {
  routines: RoutineWithProfile[];
  showUsernames?: boolean; // NEW
}) {
  if (routines.length === 0) {
    return <NothingHere message="Oops! Empty shelf…" />;
  }

  return (
    <div className={styles.grid}>
      {routines.map((routine) => (
        <RoutineCard
          key={routine.id}
          routine={routine}
          username={routine.profiles?.username ?? undefined} 
          showUsername={showUsernames}                       
        />
      ))}
    </div>
  );
}
