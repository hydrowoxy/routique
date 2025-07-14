interface ImageProps {
  image_path: string
}

import { supabase } from '@/lib/supabase'

export default async function Image({ image_path }: ImageProps) {
  const { data } = supabase.storage
    .from('routines')
    .getPublicUrl(image_path)

  const imageUrl = data?.publicUrl

  if (!imageUrl) return null

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageUrl} alt="Routine Image" width={320} />
  )
}
