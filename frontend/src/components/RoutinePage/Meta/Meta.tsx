import ShareButton from '@/components/RoutinePage/ShareButton/ShareButton'
interface MetaProps {
  id: string
  views: number | null
  favourites: number | null
}
export default function Meta({ id, views, favourites }: MetaProps) {
  return (
    <p>
      {views ?? 0} views&nbsp;·&nbsp;
      {favourites ?? 0} favorites&nbsp;
      <ShareButton routineId={id} />
    </p>
  )
}