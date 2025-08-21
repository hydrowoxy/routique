"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import Link from "next/link";

import AccentButton from "@/components/AccentButton/AccentButton";
import styles from "@/components/Login/Login.module.scss";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
  const [checking, setChecking] = useState(true);

  const router = useRouter();
  const { showSuccess: showToastSuccess, showError: showToastError } = useToast();

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      //console.log('Checking session...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      //console.log('Session data:', session);
      //console.log('Session error:', error);

      if (error) {
        console.error('Session error:', error);
        setError("Session error. Please try the reset link again.");
        setChecking(false);
        return;
      }

      if (session && session.user) {
        //console.log('Valid session found for user:', session.user.email);
        setSessionValid(true);
      } else {
        //console.log('No valid session found');
        setError("Invalid or expired reset link. Please request a new password reset.");
      }
    } catch (err) {
      console.error('Session check failed:', err);
      setError("Failed to verify reset link.");
    } finally {
      setChecking(false);
    }
  };

  const handleUpdatePassword = async () => {
    setError("");
    setSuccess(false);

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setError("Session expired. Please request a new password reset.");
        setLoading(false);
        return;
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        setError("Configuration error. Please try again.");
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey
        },
        body: JSON.stringify({
          password: password
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        setError(`Failed to update password: ${response.status} ${response.statusText}`);
        setLoading(false);
        return;
      }

      setSuccess(true);
      showToastSuccess("Password updated successfully!");

      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push("/login?message=password-updated");
      }, 1500);

    } catch (err) {
      setError("Network error occurred. Please check your connection and try again.");
      showToastError("Failed to update password. Please try again.");
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleUpdatePassword();
    }
  };

  // Loading state
  if (checking) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h1>Verifying reset link...</h1>
          </div>
        </div>
      </div>
    );
  }

  // Invalid session state
  if (!sessionValid) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h1>Invalid Reset Link</h1>
          </div>
          <div className={styles.error}>
            {error || "This password reset link is invalid or has expired."}
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link href="/forgot-password" className={styles.signupLink}>
              Request a new password reset
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Set New Password</h1>
          <div className={styles.signupPrompt}>
            <span>Enter your new password below</span>
          </div>
        </div>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.inputGroup}>
            <label>New Password</label>
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
            <label>Confirm New Password</label>
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

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {success && (
            <div className={styles.success}>
              <p>Password updated successfully! Redirecting to login...</p>
            </div>
          )}

          <AccentButton
            onClick={handleUpdatePassword}
            disabled={loading || !password || !confirmPassword || success}
          >
            {loading ? 'Updating...' : success ? 'Success!' : 'Update Password'}
          </AccentButton>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link href="/forgot-password" className={styles.signupLink}>
              Request a new password reset
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
}