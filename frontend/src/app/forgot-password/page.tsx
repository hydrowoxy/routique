"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

import AccentButton from "@/components/AccentButton/AccentButton";
import styles from "@/components/Login/Login.module.scss"; // Reuse login styles

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const { session, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && session) router.push("/");
  }, [session, authLoading, router]);

  const handleResetPassword = async () => {
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      // Get the current URL origin
      const currentOrigin = window.location.origin;
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${currentOrigin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message || "Failed to send reset email.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error("Reset password error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleResetPassword();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Reset Password</h1>
          <div className={styles.signupPrompt}>
            <span>Remember your password?</span>
            <Link href="/login" className={styles.signupLink}>
              Back to Login
            </Link>
          </div>
        </div>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              className={styles.inputField}
            />
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {success && (
            <div className={styles.success}>
              <p>Password reset email sent! Check your inbox and follow the link to reset your password.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9em', opacity: 0.8 }}>
                Don&apos;t see the email? Check your spam folder.
              </p>
            </div>
          )}

          <AccentButton
            onClick={handleResetPassword}
            disabled={loading || !email || success}
          >
            {loading ? 'Sending...' : 'Send Reset Email'}
          </AccentButton>
        </form>
      </div>
    </div>
  );
}