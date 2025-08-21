"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

import BoutiqueHeader from "@/components/BoutiqueHeader/BoutiqueHeader";
import RoutineGrid from "@/components/RoutineGrid/RoutineGrid";
import Loading from "@/components/Loading/Loading";

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

type RoutineRow = RoutineWithProfile & {
  profiles?: { username: string } | { username: string }[] | null;
};

type FaveRow = {
  created_at: string;
  routines: RoutineRow | RoutineRow[] | null;
};

const asOne = <T,>(val: T | T[] | null | undefined): T | null =>
  Array.isArray(val) ? (val[0] ?? null) : (val ?? null);

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
          routines(
            id, title, description, image_path,
            favourite_count, view_count, user_id, category,
            profiles:user_id(username)
          )
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[favourites query]", error);
        setErr(error.message);
        setRoutines([]);
      } else {
        const rows = (data as FaveRow[] | null) ?? [];

        const mapped: RoutineWithProfile[] = rows
          .map((r) => asOne(r.routines))
          .filter((rt): rt is NonNullable<typeof rt> => Boolean(rt))
          .map((rt) => {
            const profileOne = asOne(rt.profiles);
            return { ...rt, profiles: profileOne };
          });

        setRoutines(mapped);
      }

      setFetching(false);
    })();
  }, [authLoading, session?.user, router]);

  if (authLoading || fetching) return <Loading />;
  if (err) return <div style={{ padding: 16, color: "red" }}>{err}</div>;

  return (
    <main>
      <BoutiqueHeader
        title="My Boutique"
        subtitle="A collection of your favourite routines."
        count={routines.length}
      />
      <RoutineGrid routines={routines} showUsernames />
    </main>
  );
}
