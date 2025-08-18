"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

import AvatarInput from "@/components/AvatarInput/AvatarInput";
import AccentButton from "@/components/AccentButton/AccentButton";
import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import { deleteAvatar } from "@/utils/deleteAvatar";

type ProfileSubset = {
  display_name: string | null;
  avatar_path: string | null;
};

export default function SettingsPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  const uid = session?.user?.id ?? null;

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [updating, setUpdating] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string>(""); 
  const originalAvatarKeyRef = useRef<string | null>(null);
  /**
   * undefined => unchanged
   * string    => new key
   * null      => removed
   */
  const [newAvatarKey, setNewAvatarKey] = useState<string | null | undefined>(undefined);

  const [profileLoading, setProfileLoading] = useState(true);

  const COOLDOWN_MS = 3000;
  const TIMEOUT_MS = 16000;

  // Load profile once we have a user (don’t blank the whole page in the meantime)
  useEffect(() => {
    if (authLoading) return;

    if (!uid) {
      // only redirect when we *know* there’s no session
      router.replace("/login?message=session-expired");
      return;
    }

    (async () => {
      setProfileLoading(true);

      const authUsername =
        session?.user?.user_metadata?.username ??
        session?.user?.email?.split("@")[0] ??
        "Unknown";
      setUsername(authUsername);

      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, avatar_path")
        .eq("id", uid)
        .single();

      if (error) {
        console.error("[Settings] fetchProfile error:", error.message);
        setProfileLoading(false);
        return;
      }

      const row = data as ProfileSubset;
      setDisplayName(row.display_name ?? "");
      originalAvatarKeyRef.current = row.avatar_path ?? null;

      if (row.avatar_path) {
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(row.avatar_path);
        setAvatarUrl(urlData?.publicUrl || "");
      } else {
        setAvatarUrl("");
      }

      setNewAvatarKey(undefined);
      setProfileLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, uid]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(ms => (ms <= 1000 ? 0 : ms - 1000)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const updateBtnText = useMemo(() => {
    if (updating) return "Updating…";
    if (cooldown > 0) return `Wait ${Math.ceil(cooldown / 1000)}s`;
    return "Update Profile";
  }, [updating, cooldown]);

  function onAvatarUpload(key: string) {
    // AvatarInput sends "" when removed
    const normalized: string | null = key === "" ? null : key || null;
    setNewAvatarKey(normalized);

    if (normalized) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(normalized);
      setAvatarUrl(data?.publicUrl || "");
    } else {
      setAvatarUrl("");
    }
  }

  async function handleUpdateProfile() {
    if (!uid || updating || cooldown > 0) return;

    setUpdating(true);
    setCooldown(COOLDOWN_MS);

    const timeout = setTimeout(() => {
      setUpdating(false);
      alert("Server took too long. Try again in a few seconds.");
    }, TIMEOUT_MS);

    try {
      const patch: Partial<ProfileSubset> = { display_name: displayName.trim() };
      if (typeof newAvatarKey !== "undefined") patch.avatar_path = newAvatarKey;

      const { error } = await supabase.from("profiles").update(patch).eq("id", uid);

      clearTimeout(timeout);

      if (error) {
        console.error("[Settings] update error:", error.message);
        alert(`Update failed: ${error.message}`);
        return;
      }

      // delete old avatar if it was replaced/removed
      const oldKey = originalAvatarKeyRef.current;
      const changed =
        typeof newAvatarKey !== "undefined" &&
        oldKey !== null &&
        oldKey !== newAvatarKey;

      if (changed && oldKey) {
        const { error: delErr } = await deleteAvatar(oldKey);
        if (delErr) {
          const msg = typeof delErr === "string" ? delErr : delErr.message;
          console.warn("[Settings] delete old avatar warning:", msg);
        }
        originalAvatarKeyRef.current = newAvatarKey ?? null;
      }

      alert("Profile updated successfully!");
      // refresh local state
      const { data, error: refErr } = await supabase
        .from("profiles")
        .select("display_name, avatar_path")
        .eq("id", uid)
        .single();

      if (!refErr && data) {
        const row = data as ProfileSubset;
        setDisplayName(row.display_name ?? "");
        originalAvatarKeyRef.current = row.avatar_path ?? null;
        if (row.avatar_path) {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(row.avatar_path);
          setAvatarUrl(urlData?.publicUrl || "");
        } else {
          setAvatarUrl("");
        }
        setNewAvatarKey(undefined);
      }
    } catch (err) {
      clearTimeout(timeout);
      const msg = err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";
      console.error("[Settings] unexpected:", msg);
      alert(`Unexpected error: ${msg}`);
    } finally {
      setUpdating(false);
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push("/");
    else console.error("[Settings] logout failed:", error.message);
  }

  // Render a small skeleton while auth/profile are loading instead of returning null
  const avatarSkeleton = (
    <div
      style={{
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: "var(--muted)",
      }}
    />
  );

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 20px 80px" }}>
      <h1 style={{ fontWeight: 800, fontSize: 32, paddingTop: 20, marginBottom: 18 }}>
        Settings
      </h1>

      <div style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 20, fontWeight: 700 }}>Profile Information</div>

        {/* Always mount AvatarInput so the circle shows immediately.
            It will update its preview when avatarUrl/original key arrive. */}
        {uid ? (
          profileLoading ? (
            avatarSkeleton
          ) : (
            <AvatarInput
              userId={uid}
              existingUrl={avatarUrl || null}
              existingKey={originalAvatarKeyRef.current}
              onUpload={onAvatarUpload}
              sizePx={120}
              // If you still see stale state, uncomment this key to force remount when the DB key changes:
              // key={`${uid}:${originalAvatarKeyRef.current ?? "none"}`}
            />
          )
        ) : (
          avatarSkeleton
        )}

        <div style={{ color: "var(--subtext)", fontSize: 12, marginTop: 6 }}>
          Square image recommended. Large images are auto-cropped & resized.
        </div>
      </div>

      <div style={{ margin: "16px 0 6px", color: "var(--subtext)", fontSize: 12 }}>Username</div>
      <Input value={username} onChange={() => {}} disabled placeholder="username" />

      <div style={{ margin: "18px 0 6px", color: "var(--subtext)", fontSize: 12 }}>
        Display Name
      </div>
      <Input
        value={displayName}
        onChange={setDisplayName}
        placeholder="Enter display name"
        disabled={updating}
      />

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <AccentButton onClick={handleUpdateProfile} disabled={updating || cooldown > 0}>
          {updateBtnText}
        </AccentButton>
        <Button onClick={handleLogout} disabled={updating}>
          Logout
        </Button>
      </div>
    </div>
  );
}
