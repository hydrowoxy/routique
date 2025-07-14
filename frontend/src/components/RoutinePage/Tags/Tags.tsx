export default function Tags({ tags }: { tags: string[] | null }) {
  if (!tags || tags.length === 0) return null
  return (
    <p>
      {tags.map((t) => (
        <span key={t}>#{t}&nbsp;</span>
      ))}
    </p>
  )
}