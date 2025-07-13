import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function UsernamePage(props: { params: Promise<{ username: string }> }) {
    const params = await props.params
    const { username } = params

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .eq('username', username)
        .single()

    if (!profile) return notFound()

    return (
        <div>
            <h1>{profile.display_name || profile.username}&apos;s Routines</h1>
            {/* todo Render public profile info here */}
        </div>
    )
}
