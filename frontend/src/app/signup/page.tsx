"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

import AccentButton from "@/components/AccentButton/AccentButton";
import styles from "@/components/Signup/Signup.module.scss";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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

    if (!email || !password || !confirmPassword || !username || !displayName) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the terms & conditions.");
      return;
    }

    if (!validUsername(username)) {
      setError(
        "Username must start with a letter, be 3–20 chars, and only contain letters, numbers, and underscores."
      );
      return;
    }
    if (!validDisplay(displayName)) {
      setError(
        "Display name must be 2–50 chars and may contain letters, numbers, spaces, dashes, and apostrophes."
      );
      return;
    }

    setLoading(true);

    // Check if username is taken
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

    const { data: emailTaken } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .limit(1);

    if ((emailTaken?.length ?? 0) > 0) {
      setError(
        "An account with this email already exists. Try logging in instead."
      );
      setLoading(false);
      return;
    }

    // Attempt sign up directly
    const { data, error: signupErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
        data: {
          username,
          display_name: displayName,
        },
      },
    });

    if (signupErr) {
      if (signupErr.message === "User already registered") {
        setError(
          "An account with this email already exists. Try logging in instead."
        );
      } else {
        setError(signupErr.message || "Signup failed.");
      }
      setLoading(false);
      return;
    }

    if (!data?.user) {
      setError("Signup failed.");
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
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
      },
    });
    setLoading(false);
    if (resendErr) setError("Resend failed: " + resendErr.message);
    else setSuccess(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignup();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Sign Up</h1>
          <div className={styles.loginPrompt}>
            <span>Already have an account?</span>
            <Link href="/login" className={styles.loginLink}>
              Login
            </Link>
          </div>
        </div>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.inputGroup}>
            <label>Username</label>
            <input
              type="text"
              placeholder="ex: jon_smith"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              className={styles.inputField}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Display Name</label>
            <input
              type="text"
              placeholder="ex: Jon Smith"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              className={styles.inputField}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              placeholder="ex: jon.smith@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              className={styles.inputField}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={loading}
                className={styles.passwordInput}
              />
              <button
                type="button"
                className={styles.showPasswordButton}
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Confirm password</label>
            <div className={styles.passwordContainer}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={loading}
                className={styles.passwordInput}
              />
              <button
                type="button"
                className={styles.showPasswordButton}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className={styles.termsContainer}>
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className={styles.checkbox}
              disabled={loading}
            />
            <label htmlFor="terms" className={styles.termsText}>
              I read and understand the{' '}
              <Link href="/terms" className={styles.termsLink}>
                terms & policy
              </Link>
              .
            </label>
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {success && (
            <div className={styles.success}>
              <p>Check your inbox to confirm your e-mail, then log in.</p>
              <button 
                onClick={handleResend} 
                disabled={loading || !email}
                className={styles.resendButton}
              >
                Resend confirmation e-mail
              </button>
            </div>
          )}

          <AccentButton
            onClick={handleSignup}
            disabled={loading || !email || !password || !confirmPassword || !username || !displayName || !acceptedTerms}
          >
            {loading ? 'Signing up...' : 'Register'}
          </AccentButton>
        </form>
      </div>
    </div>
  );
}