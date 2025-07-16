'use client'

type Props = {
  routineId: string
}

export default function EditButton({ routineId }: Props) {
  return (
    <button
      type="button"
      onClick={() => {
        window.location.href = `/routine/${routineId}/edit`;
      }}
    >
      Edit
    </button>
  )
}
