'use client'

import { useState } from 'react'
import FavouriteButton from '@/components/RoutinePage/FavouriteButton/FavouriteButton'
import Meta from '@/components/RoutinePage/Meta/Meta'

export default function FavouriteArea({
  id,
  initialViews,
  initialFavourites
}: {
  id: string
  initialViews: number | null
  initialFavourites: number | null
}) {
  const [favourites, setFavourites] = useState(initialFavourites ?? 0)

  return (
    <>
      <FavouriteButton
        routineId={id}
        onFavouritesChange={delta => setFavourites(f => f + delta)}
      />

      <Meta id={id} views={initialViews} favourites={favourites} />
    </>
  )
}
