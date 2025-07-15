'use client'

import { useState } from 'react'
import FavouriteButton from '@/components/RoutinePage/FavouriteButton/FavouriteButton'

export default function FavouriteArea({
  id,
  initialFavourites
}: {
  id: string
  initialFavourites: number | null
}) {
  const [favourites, setFavourites] = useState(initialFavourites ?? 0)

  return (
    <>
      <FavouriteButton
        routineId={id}
        onFavouritesChange={delta => setFavourites(f => f + delta)}
      />

      <p>
        {favourites} favorites&nbsp;·&nbsp;
      </p>
    </>
  )
}
