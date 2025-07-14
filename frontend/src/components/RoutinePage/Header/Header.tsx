interface HeaderProps {
  title: string
  profile: {
    id: string
    username: string
    display_name: string | null
  }
}

export default function Header({ title, profile }: HeaderProps) {
  return (
    <>
      <h1>{title}</h1>
      <p>
        by&nbsp;
        <a href={`/${profile.username}`}>
          {profile.display_name || profile.username}
        </a>
      </p>
    </>
  )
}
