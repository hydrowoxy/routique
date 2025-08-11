"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./Nav.module.scss";

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
    <nav className={styles.nav}>
      {session ? (
        <>
          <Link href="/" className={styles.item} aria-label="Home">
            <Image className={styles.icon} src="/icons/home.svg" alt="" width={15} height={15} />
          </Link>

          <Link href="/favourites" className={styles.item} aria-label="Favourites">
            <Image className={styles.icon} src="/icons/heart.svg" alt="" width={15} height={15} />
          </Link>

          <Link href="/search" className={styles.item} aria-label="Search">
            <Image className={styles.icon} src="/icons/search.svg" alt="" width={15} height={15} />
          </Link>

          <Link href="/create" className={styles.item} aria-label="Create">
            <Image className={styles.icon} src="/icons/create.svg" alt="" width={15} height={15} />
          </Link>

          {/* Placeholder pfp (no functionality yet) */}
          <Link href={username ? `/${username}` : "/settings"} className={styles.item} aria-label="My Page">
            <span className={styles.avatarPlaceholder} />
          </Link>
        </>
      ) : (
        <>
          <Link href="/signup" className={styles.item}>Sign Up</Link>
          <Link href="/login" className={styles.item}>Log In</Link>
        </>
      )}
    </nav>
  );
}
