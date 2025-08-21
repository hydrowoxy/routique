"use client";

// this file is a fucking mess

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";

import AvatarInput from "@/components/AvatarInput/AvatarInput";
import AccentButton from "@/components/AccentButton/AccentButton";
import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import Link from "next/link"; 
import Loading from "@/components/Loading/Loading";

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

  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const COOLDOWN_MS = 3000;
  const TIMEOUT_MS = 16000;

  // Load profile once we have a user
  useEffect(() => {
    if (authLoading) return;

    if (!uid) {
      router.replace("/login?message=session-expired");
      return;
    }

    //console.log('[Settings] Starting profile fetch...');
    const startTime = Date.now();
    
    let isMounted = true;

    const fetchProfile = async () => {
      setProfileLoading(true);

      try {
        const authUsername =
          session?.user?.user_metadata?.username ??
          session?.user?.email?.split("@")[0] ??
          "Unknown";
        
        if (isMounted) setUsername(authUsername);

        // Simple Supabase call without abort signal
        const { data, error } = await supabase
          .from("profiles")
          .select("display_name, avatar_path")
          .eq("id", uid)
          .single();

        if (error) {
          console.error("[Settings] fetchProfile error:", error.message);
          if (isMounted) setProfileLoading(false);
          return;
        }

        //console.log('[Settings] Profile fetch completed in:', Date.now() - startTime, 'ms');

        if (!isMounted) return; // Component unmounted

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

      } catch (err) {
        if (isMounted) {
          console.error("[Settings] Unexpected error:", err);
          setProfileLoading(false);
        }
      }
    };

    fetchProfile();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [authLoading, uid, router, session?.user?.user_metadata?.username, session?.user?.email]);

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

  function handleDeleteAccount() {
    setShowDeleteConfirm(true);
    setDeleteConfirmText("");
  }

  function cancelDelete() {
    setShowDeleteConfirm(false);
    setDeleteConfirmText("");
  }

  async function confirmDeleteAccount() {
    if (!uid || deleting) return;
    
    if (deleteConfirmText.toLowerCase() !== "delete my account") {
      showError('Please type "delete my account" to confirm.');
      return;
    }

    setDeleting(true);

    try {
      // Delete from profiles table (should cascade to routines, likes, etc.)
      const { error: deleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", uid);

      if (deleteError) {
        console.error("[Settings] delete profile error:", deleteError.message);
        showError(`Failed to delete account: ${deleteError.message}`);
        setDeleting(false);
        return;
      }

      // Sign out the user
      await supabase.auth.signOut();
      
      // Redirect to home page
      router.push("/?message=account-deleted");
      
    } catch (err) {
      console.error("[Settings] delete account error:", err);
      const msg = err instanceof Error ? err.message : "Unknown error occurred";
      showError(`Failed to delete account: ${msg}`);
      setDeleting(false);
    }
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

  if (authLoading) {
    return <Loading />;
  }

  if (!uid) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 20px 80px" }}>
        <h1 style={{ fontWeight: 800, fontSize: 32, paddingTop: 20, marginBottom: 18 }}>
          Settings
        </h1>
        <div style={{ color: "var(--subtext)", padding: "40px 0" }}>
          Please log in to access settings.
        </div>
      </div>
    );
  }

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

      <div style={{ marginTop: 40, padding: "20px 0", borderTop: "1px solid var(--border)" }}>
        <div style={{ marginBottom: 16, fontWeight: 700, color: "var(--text)" }}>
          Danger Zone
        </div>
        
        {!showDeleteConfirm ? (
          <div>
            <div style={{ color: "var(--subtext)", fontSize: 12, marginBottom: 12 }}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </div>
            <Button 
              onClick={handleDeleteAccount}
              disabled={updating || deleting}
              style={{ 
                backgroundColor: "#dc2626", 
                color: "white",
                border: "1px solid #dc2626"
              }}
            >
              Delete Account
            </Button>
          </div>
        ) : (
          <div style={{ 
            backgroundColor: "var(--muted)", 
            padding: 16, 
            borderRadius: 8,
            border: "1px solid #dc2626"
          }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: "#dc2626" }}>
              ⚠️ Delete Account Confirmation
            </div>
            <div style={{ color: "var(--text)", fontSize: 14, marginBottom: 16 }}>
              This will permanently delete your account, all your routines, likes, and other data. 
              This action is <strong>irreversible</strong>.
            </div>
            <div style={{ marginBottom: 12, fontSize: 12, color: "var(--subtext)" }}>
              Type &quot;delete my account&quot; to confirm:
            </div>
            <div style={{ marginBottom: 12 }}>
              <Input
                value={deleteConfirmText}
                onChange={setDeleteConfirmText}
                placeholder="delete my account"
                disabled={deleting}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                onClick={confirmDeleteAccount}
                disabled={deleting || deleteConfirmText.toLowerCase() !== "delete my account"}
                style={{ 
                  backgroundColor: "#dc2626", 
                  color: "white",
                  border: "1px solid #dc2626"
                }}
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </Button>
              <Button onClick={cancelDelete} disabled={deleting}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 24, textAlign: "left", display: "flex", flexDirection: "column", gap: 8 }}>
        <Link 
          href="/terms" 
          style={{ 
            color: "var(--subtext)", 
            fontSize: 12, 
            textDecoration: "underline" 
          }}
        >
          View our terms and conditions
        </Link>
        
        <div style={{ color: "var(--subtext)", fontSize: 12 }}>
          For questions, concerns, or to report content, reach us at{" "}
          <a 
            href="mailto:routique.team@gmail.com"
            style={{ 
              color: "var(--subtext)", 
              textDecoration: "underline" 
            }}
          >
            routique.team@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
