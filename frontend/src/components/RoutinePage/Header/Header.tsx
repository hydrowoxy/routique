import styles from "./Header.module.scss";

interface HeaderProps {
  title: string;
  profile: {
    username: string;
    display_name?: string;
  };
}

export default function Header({ title, profile }: HeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.byline}>
        <a href={`/${profile.username}`}>
          {profile.display_name || profile.username}
        </a>
      </p>
    </header>
  );
}
