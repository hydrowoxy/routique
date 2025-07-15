'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function FavouriteButton(
  {
    routineId,
    onFavouritesChange = () => {}       
  }: {
    routineId: string
    onFavouritesChange?: (delta: number) => void
  }
) {
  const [isFavourite, setIsFavourite] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    console.log('in useffect')
    const load = async () => {
      console.log('getsession')
      const user = (await supabase.auth.getSession()).data.session?.user
      if (!user) return

      const { data } = await supabase
        .from('favourites')
        .select('id')
        .eq('user_id', user.id)
        .eq('routine_id', routineId)
        .maybeSingle()

      setIsFavourite(!!data)
    }
    load()
  }, [routineId])

  const toggleFavourite = async () => {
    console.log('in toggleFavourite')
    const user = (await supabase.auth.getSession()).data.session?.user
    console.log('after the await supabase auth getuser')

    if (!user) {
      alert('You must be logged in to favourite this routine.')
      return
    }

    setLoading(true)
    console.log('just set loading true')

    try {
      console.log('in try')
      if (isFavourite) {
        console.log("it's favourited already")
        const { error } = await supabase
          .from('favourites')
          .delete()
          .eq('user_id', user.id)
          .eq('routine_id', routineId)

        console.log('finished sql')
        if (error) throw error
        onFavouritesChange(-1)            
      } else {
        console.log("it's not favourited already")
        const { error } = await supabase
          .from('favourites')
          .insert({ user_id: user.id, routine_id: routineId })

        console.log('finished sql')
        if (error) throw error
        onFavouritesChange(1)             
      }
      console.log("guess nothing's errored yet")
      console.log("isfavourite was: it's " + isFavourite)
      setIsFavourite(!isFavourite)
      console.log('toggling the setisfavourite: it\'s ' + isFavourite)
    } catch (err) {
      console.error('[favourite toggle]', err)
      alert('Something went wrong. Please try again.')
    }

    console.log('setloading false')
    setLoading(false)
  }

  return (
    <button onClick={toggleFavourite} disabled={loading}>
      {isFavourite ? '❤️ Favorited' : '🤍 Favourite'}
    </button>
  )
}
