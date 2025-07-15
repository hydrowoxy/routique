import EditRoutineForm from '@/components/RoutineForm/EditRoutineForm'

export default function EditPage({ params }: { params: { id: string } }) {
  const id = params.id

  return (
    <main>
      <EditRoutineForm routineId={id} />
    </main>
  )
}
