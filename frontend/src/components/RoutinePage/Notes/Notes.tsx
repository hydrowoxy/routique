export default function Notes({ notes }: { notes: string | null }) {
  if (!notes) return null
  return (
    <>
      <h2>Notes</h2>
      <p>{notes}</p>
    </>
  )
}