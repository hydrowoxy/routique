"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import RoutineGrid from "@/components/RoutineGrid/RoutineGrid";
import Loading from "@/components/Loading/Loading";

import { CATEGORY_GROUPS } from "@/lib/categories"; 
import styles from "./Explore.module.scss";

import type { Database } from "@/lib/database.types";

type Routine = Pick<
  Database["public"]["Tables"]["routines"]["Row"],
  "id" | "title" | "description" | "image_path" | "favourite_count" | "view_count" | "user_id" | "category"
>;

const TABS = ["All Routines", ...Object.keys(CATEGORY_GROUPS)];

export default function Explore() {
  const { loading: authLoading } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("All Routines");

  const fetchRoutines = async () => {
    try {
      const { data, error } = await supabase
        .from("routines")
        .select("id, title, description, image_path, favourite_count, view_count, user_id, category");

      if (error) {
        console.error("[Explore] Failed to fetch routines:", error);
        setRoutines([]);
      } else {
        setRoutines(data ?? []);
      }
    } catch (err) {
      console.error("[Explore] Unexpected error:", err);
      setRoutines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchRoutines();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchRoutines();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [authLoading]);

  const visibleRoutines =
    selectedTab === "All Routines"
      ? routines
      : routines.filter((r) =>
          CATEGORY_GROUPS[selectedTab as keyof typeof CATEGORY_GROUPS]?.includes(r.category ?? "")
        );

  return (
    <div>
      <h2 className={styles.heading}>Explore Routines</h2>

      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={selectedTab === tab ? styles.activeTab : ""}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading || authLoading ? (
        <Loading />
      ) : (
        <RoutineGrid routines={visibleRoutines} />
      )}
    </div>
  );
}
