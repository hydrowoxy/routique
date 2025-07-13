"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const { session, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && session) router.push("/");
  }, [session, authLoading, router]);

  const validUsername = (name: string) =>
    /^(?!.*__)(?!.*_$)[a-zA-Z][a-zA-Z0-9_]{2,19}$/.test(name);
  const validDisplay = (d: string) => /^[a-zA-Z0-9-' ]{2,50}$/.test(d);

  const handleSignup = async () => {
    setError("");
    setSuccess(false);

    if (!email || !password || !username || !displayName) {
      setError("Please fill in all fields.");
      return;
    }
    if (!validUsername(username)) {
      setError("Username must start with a letter, be 3–20 chars, and only contain letters, numbers, and underscores.");
      return;
    }
    if (!validDisplay(displayName)) {
      setError("Display name must be 2–50 chars and may contain letters, numbers, spaces, dashes, and apostrophes.");
      return;
    }

    setLoading(true);

    const { data: taken } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .limit(1);

    if ((taken?.length ?? 0) > 0) {
      setError("Username already taken.");
      setLoading(false);
      return;
    }

    const { data, error: signupErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:3000/dashboard",
        data: {
          username,
          display_name: displayName,
        },
      },
    });

    if (signupErr || !data?.user) {
      setError(signupErr?.message || "Signup failed.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const handleResend = async () => {
    setLoading(true);
    const { error: resendErr } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: "http://localhost:3000/dashboard" },
    });
    setLoading(false);
    if (resendErr) setError("Resend failed: " + resendErr.message);
    else setSuccess(true);
  };

  return (
    <div>
      <h1>Sign Up</h1>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />

      <button onClick={handleSignup} disabled={loading || !email || !password || !username || !displayName}>
        {loading ? "Signing up…" : "Sign Up"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && (
        <>
          <p style={{ color: "green" }}>Check your inbox to confirm your e-mail, then log in.</p>
          <button onClick={handleResend} disabled={loading || !email}>Resend confirmation e-mail</button>
        </>
      )}
    </div>
  );
}