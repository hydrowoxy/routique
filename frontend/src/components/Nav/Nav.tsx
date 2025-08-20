"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import styles from "./Nav.module.scss";

// helper: build a public URL from a bucket + relative path
function publicUrlFromPath(bucket: string, path?: string | null): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl ?? null;
}

export default function Nav() {
  const { session } = useAuth();
  const uid = session?.user?.id ?? null;

  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Pull username from the session
  useEffect(() => {
    if (!session?.user) {
      setUsername(null);
      return;
    }
    const u =
      session.user.user_metadata?.username ||
      session.user.email?.split("@")[0] ||
      null;
    setUsername(u);
  }, [session?.user]);

  // Fetch avatar on mount / user change
  useEffect(() => {
    if (!uid) {
      setAvatarUrl(null);
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_path")
        .eq("id", uid)
        .single();

      if (error) {
        console.warn("[Nav] profiles fetch error:", error.message);
        setAvatarUrl(null);
        return;
      }

      console.debug("[Nav] avatar_path from DB:", data?.avatar_path);
      const url = publicUrlFromPath("avatars", data?.avatar_path);
      console.debug("[Nav] computed avatarUrl:", url);
      setAvatarUrl(url);
    })();
  }, [uid]);

  // Live-update the avatar when the row changes
  useEffect(() => {
    if (!uid) return;

    const channel = supabase
      .channel(`profiles_avatar_${uid}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${uid}` },
        (payload) => {
          // @ts-expect-error payload.new is typed loosely
          const newPath = payload?.new?.avatar_path as string | null | undefined;
          console.debug("[Nav] realtime update, new avatar_path:", newPath);
          setAvatarUrl(publicUrlFromPath("avatars", newPath));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [uid]);

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.item} aria-label="Home">
        <Image className={styles.icon} src="/icons/home.svg" alt="" width={15} height={15} />
      </Link>

      <Link href={session ? "/boutique" : "/login"} className={styles.item} aria-label="Boutique">
        <Image className={styles.icon} src="/icons/heart.svg" alt="" width={15} height={15} />
      </Link>

      <Link href={session ? "/create" : "/login"} className={styles.item} aria-label="Create">
        <Image className={styles.icon} src="/icons/create.svg" alt="" width={15} height={15} />
      </Link>

      {/* Avatar - shows placeholder when not logged in, real avatar when logged in */}
      <Link
        href={session && username ? `/${username}` : "/login"}
        className={styles.item}
        aria-label="My Page"
      >
        {session && avatarUrl ? (
          <img
            className={styles.avatar}
            src={avatarUrl}
            alt=""
            onError={() => {
              console.warn("[Nav] avatar <img> onError -> showing placeholder");
              setAvatarUrl(null);
            }}
          />
        ) : (
          <span className={styles.avatarPlaceholder} />
        )}
      </Link>
    </nav>
  );
}