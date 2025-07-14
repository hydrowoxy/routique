"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export default function Nav() {
  const { session } = useAuth();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      const authUsername =
        session.user.user_metadata?.username ||
        session.user.email?.split("@")[0] ||
        null;

      setUsername(authUsername);
    } else {
      setUsername(null);
    }
  }, [session]);

  return (
    <nav>
      <Link href="/">Home</Link>
      {session ? (
        <>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/create">Create</Link>
          <Link href="/settings">Settings</Link>
          {username && <Link href={`/${username}`}>My Page</Link>}
        </>
      ) : (
        <>
          <Link href="/signup">Sign Up</Link>
          <Link href="/login">Log In</Link>
        </>
      )}
    </nav>
  );
}
