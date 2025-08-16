"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

import RoutineGrid from "@/components/RoutineGrid/RoutineGrid";
import Loading from "@/components/Loading/Loading";

import BoutiqueHeader from "@/components/BoutiqueHeader/BoutiqueHeader";

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

export default function BoutiquePage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [fetching, setFetching] = useState(true);
  const [err, setErr] = useState("");
  const [routines, setRoutines] = useState<RoutineWithProfile[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!session?.user) {
      router.push("/login");
      return;
    }

    (async () => {
      setFetching(true);
      setErr("");

      const { data, error } = await supabase
        .from("favourites")
        .select(`
          created_at,
          routines: routine_id (
            id, title, description, image_path,
            favourite_count, view_count, user_id, category,
            profiles: user_id ( username )
          )
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setErr(error.message);
        setRoutines([]);
      } else {
        const rows = (data ?? []).filter(Boolean);
        const mapped = rows
          .map((r: { routines: RoutineWithProfile }) => r.routines)
          .filter(Boolean) as RoutineWithProfile[];
        setRoutines(mapped);
      }

      setFetching(false);
    })();
  }, [authLoading, session?.user, router]);

  if (authLoading || fetching) return <Loading />;
  if (err) return <div style={{ padding: 16, color: "red" }}>{err}</div>;

    return (
    <main>
        <BoutiqueHeader count={routines.length} />
        <RoutineGrid routines={routines} showUsernames />
    </main>
    );
}
