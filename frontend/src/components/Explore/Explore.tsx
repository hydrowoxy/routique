"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import RoutineGrid from "@/components/RoutineGrid/RoutineGrid";
import Loading from "@/components/Loading/Loading";
import Categories from "@/components/Categories/Categories";

import { CATEGORIES } from "@/lib/categories";
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

  useEffect(() => {
    if (authLoading) return;

    //console.log('[Explore] Starting data fetch...', { authLoading });
    const startTime = Date.now();
    
    let isMounted = true;

    const fetchRoutines = async () => {
      //console.log('[Explore] fetchRoutines called, isMounted:', isMounted);
      
      try {
        //console.log('[Explore] Making Supabase request...');
        
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

        //console.log('[Explore] Supabase response received:', { 
        //  dataLength: data?.length, 
        //  error: error?.message,
        //  isMounted 
        //});

        if (error) {
          console.error("[Explore] Failed to fetch routines:", error);
          if (isMounted) {
            //console.log('[Explore] Setting empty routines due to error');
            setRoutines([]);
            setLoading(false);
          }
        } else {
          //console.log('[Explore] Data fetch completed in:', Date.now() - startTime, 'ms');
          if (isMounted) {
            //console.log('[Explore] Setting routines data:', data?.length, 'items');
            setRoutines(data ?? []);
            setLoading(false);
          } else {
            //console.log('[Explore] Component unmounted, skipping state update');
          }
        }
      } catch (err) {
        //console.log('[Explore] Catch block hit:', err);
        if (isMounted) {
          console.error("[Explore] Unexpected error:", err);
          setRoutines([]);
          setLoading(false);
        }
      }
    };

    fetchRoutines();

    return () => {
      //console.log('[Explore] Cleanup function called');
      isMounted = false;
    };
  }, [authLoading]); 

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
