import EditRoutineForm from '@/components/RoutineForm/EditRoutineForm'

export default async function EditPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  return (
    <main>
      <EditRoutineForm routineId={id} />
    </main>
  )
}