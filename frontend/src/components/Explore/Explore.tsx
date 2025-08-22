"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import RoutineGrid from "@/components/RoutineGrid/RoutineGrid";
import Loading from "@/components/Loading/Loading";
import Categories from "@/components/Categories/Categories";

import { CATEGORIES } from "@/lib/categories";
import type { Category } from "@/lib/categories";
import styles from "./Explore.module.scss";

import type { Database } from "@/lib/database.types";

// Updated type to match what RoutineGrid expects
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

const TABS = ["All", ...CATEGORIES];

export default function Explore() {
  const { loading: authLoading } = useAuth();
  const [routines, setRoutines] = useState<RoutineWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>("All");

  useEffect(() => {
    if (authLoading) return;

    let isMounted = true;

    const fetchRoutines = async () => {
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
          if (isMounted) {
            setRoutines([]);
            setLoading(false);
          }
        } else {
          if (isMounted) {
            // Transform the data to match our type
            const transformedData = (data ?? []).map((routine) => ({
              ...routine,
              profiles:
                Array.isArray(routine.profiles) && routine.profiles.length > 0
                  ? routine.profiles[0]
                  : null,
            }));
            setRoutines(transformedData);
            setLoading(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("[Explore] Unexpected error:", err);
          setRoutines([]);
          setLoading(false);
        }
      }
    };

    fetchRoutines();

    return () => {
      isMounted = false;
    };
  }, [authLoading]);

  const visibleRoutines =
    selectedTab === "All"
      ? routines
      : routines.filter((r) => (r.category ?? "") === selectedTab);

  const handleCategorySelect = (category: Category) => {
    setSelectedTab(category);
  };

  return (
    <div className={styles.explore}>
      <Categories
        tabs={TABS}
        selectedTab={selectedTab}
        onTabSelect={setSelectedTab}
      />

      {loading || authLoading ? (
        <Loading />
      ) : (
        <RoutineGrid
          routines={visibleRoutines}
          showCategoryCards={true}
          currentCategory={selectedTab}
          onCategorySelect={handleCategorySelect}
        />
      )}
    </div>
  );
}
