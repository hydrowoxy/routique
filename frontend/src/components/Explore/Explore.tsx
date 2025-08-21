"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import RoutineGrid from "@/components/RoutineGrid/RoutineGrid";
import Loading from "@/components/Loading/Loading";
import Categories from "@/components/Categories/Categories";

import { CATEGORIES } from "@/lib/categories"; // <-- flat list
import styles from "./Explore.module.scss";

import type { Database } from "@/lib/database.types";

type Routine = Pick<
  Database["public"]["Tables"]["routines"]["Row"],
  "id" | "title" | "description" | "image_path" | "favourite_count" | "view_count" | "user_id" | "category"
>;

const TABS = ["All", ...CATEGORIES];

export default function Explore() {
  const { loading: authLoading } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>("All");

  const fetchRoutines = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("routines")
        .select(`
          id,
          title,
          description,
          image_path,
          favourite_count,
          view_count,
          user_id,
          category,
          profiles!inner (
            username
          )
        `);

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
  }, []);

  useEffect(() => {
    if (authLoading) return;
    fetchRoutines();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchRoutines();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [authLoading, fetchRoutines]);

  const visibleRoutines =
    selectedTab === "All"
      ? routines
      : routines.filter((r) => (r.category ?? "") === selectedTab);

  return (
    <div className={styles.explore}>
      <Categories
        tabs={TABS}
        selectedTab={selectedTab}
        onTabSelect={setSelectedTab}
      />

      {loading || authLoading ? <Loading /> : <RoutineGrid routines={visibleRoutines} />}
    </div>
  );
}
