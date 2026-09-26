import { Link } from 'react-router-dom'
import {
  categoryLabels,
  difficultyLabels,
  goalLabels,
  type Activity,
} from '../data/activities'
import { places } from '../data/places'

export function ActivityCard({
  activity,
  reasons,
}: {
  activity: Activity
  reasons?: string[]
}) {
  const nearby = places.filter((place) => activity.placeIds.includes(place.id))

  return (
    <article className="card">
      <p className="pill">
        {categoryLabels[activity.category]} · {difficultyLabels[activity.difficulty]}
      </p>
      <h3>{activity.name}</h3>
      <p>{activity.description}</p>
      <p className="why">{activity.whyItHelps}</p>
      {reasons && reasons.length > 0 && (
        <ul className="reasons">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      )}
      <p className="meta">
        Helps with: {activity.goals.map((goal) => goalLabels[goal]).join(', ')}
      </p>
      <p className="meta">Near: {nearby.map((place) => place.name).slice(0, 2).join(' · ')}</p>
      <Link className="ghost-link" to={`/map?place=${nearby[0]?.id ?? ''}`}>
        See on map
      </Link>
    </article>
  )
}
