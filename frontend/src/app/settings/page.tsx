"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";

import AvatarInput from "@/components/AvatarInput/AvatarInput";
import AccentButton from "@/components/AccentButton/AccentButton";
import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";

type ProfileSubset = {
  display_name: string | null;
  avatar_path: string | null;
};

export default function SettingsPage() {
  const { session, loading: authLoading } = useAuth();
  const { showError, showSuccess } = useToast();
  const router = useRouter();

  const uid = session?.user?.id ?? null;

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [updating, setUpdating] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string>(""); 
  const originalAvatarKeyRef = useRef<string | null>(null);
  const [newAvatarKey, setNewAvatarKey] = useState<string | null | undefined>(undefined);

  const [profileLoading, setProfileLoading] = useState(true);

  const COOLDOWN_MS = 3000;
  const TIMEOUT_MS = 16000;

  // Load profile once we have a user
  useEffect(() => {
    if (authLoading) return;

    if (!uid) {
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
      showError("Server took too long. Try again in a few seconds.");
    }, TIMEOUT_MS);

    try {
      const patch: Partial<ProfileSubset> = { display_name: displayName.trim() };
      if (typeof newAvatarKey !== "undefined") {
        patch.avatar_path = newAvatarKey;
      }

      const { error } = await supabase.from("profiles").update(patch).eq("id", uid);

      clearTimeout(timeout);

      if (error) {
        console.error("[Settings] update error:", error.message);
        showError(`Update failed: ${error.message}`);
        return;
      }

      // Update the reference to the new avatar key
      if (typeof newAvatarKey !== "undefined") {
        originalAvatarKeyRef.current = newAvatarKey;
      }

      showSuccess("Profile updated successfully!");
      
      // Refresh local state
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
      showError(`Unexpected error: ${msg}`);
    } finally {
      setUpdating(false);
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push("/");
    else console.error("[Settings] logout failed:", error.message);
  }

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
