import { supabase } from '@/lib/supabaseServer'  // ✅ not the client one!

export default async function UsernamePage({ params }: { params: { username: string } }) {
  const { username } = params

  const { data: profile, error } = await supabase()
    .from('profiles')
    .select('id, username, display_name')
    .eq('username', username)
    .single()

  if (!profile) return notFound()

  return (
    <div>
      <h1>{profile.display_name || profile.username}&apos;s Routines</h1>
    </div>
  )
}