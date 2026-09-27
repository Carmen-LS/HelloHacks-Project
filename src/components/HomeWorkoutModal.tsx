import { useState } from 'react'
import { createPortal } from 'react-dom'

const workouts = [
  {
    id: 'strength',
    label: 'Strength',
    icon: '✦',
    videos: [
      { title: '6 Upper Body Strength Exercises for Older Adults', source: 'National Institute on Aging', detail: 'A 15-minute routine. Most exercises can be done without equipment.', videoId: 'pUYxcRvdal8' },
      { title: 'Lower Limb Class', source: 'NHS MSK Physiotherapy Service', detail: 'A guided lower-body class focused on strength and balance.', videoId: '6-Te-Bt_hsc' },
      { title: 'Older Adults Class', source: 'NHS MSK Physiotherapy Service', detail: 'A guided class for older adults focused on balance and strength.', videoId: '6ZewaAumizY' },
    ],
  },
  {
    id: 'balance',
    label: 'Balance',
    icon: '◉',
    videos: [
      { title: 'Balance Class', source: 'NHS MSK Physiotherapy Service', detail: 'A class for people who want help with balance or confidence while moving.', videoId: 'Hx9vAAoERCQ' },
      { title: 'Older Adults Class', source: 'NHS MSK Physiotherapy Service', detail: 'A guided class for older adults focused on balance and strength.', videoId: '6ZewaAumizY' },
      { title: 'Balance and Mobility Exercises', source: 'ChoosePT · American Physical Therapy Association', detail: 'Exercises led by a physical therapist with experience in balance training for older adults.', videoId: 'NEFYsHkF_LQ' },
    ],
  },
  {
    id: 'mobility',
    label: 'Mobility',
    icon: '↗',
    videos: [
      { title: '10-minute Sample Workout for Older Adults', source: 'National Institute on Aging · Go4Life', detail: 'A gentle routine with a warm-up, strength, flexibility, balance, and a cool-down.', videoId: 'G1lwVhnnkoU' },
      { title: 'Back Class', source: 'NHS MSK Physiotherapy Service', detail: 'Guided movements to build strength and confidence moving your back.', videoId: 'nYQjeJvi57s' },
      { title: 'Shoulder Class', source: 'NHS MSK Physiotherapy Service', detail: 'Shoulder movements with options to adjust them to your ability.', videoId: '7uhij7NmhHU' },
    ],
  },
  {
    id: 'flexibility',
    label: 'Flexibility',
    icon: '〰',
    videos: [
      { title: '6 Flexibility Exercises for Older Adults', source: 'National Institute on Aging', detail: 'A gentle stretching routine; most exercises can be done without equipment.', videoId: 'KcdkySvCRCc' },
      { title: '4 Flexibility and Cool Down Exercises for Older Adults', source: 'National Institute on Aging', detail: 'A 10-minute routine with stretches and cooldown exercises.', videoId: 'kCQ6irSQwYA' },
      { title: 'Seniors Morning Yoga Routine', source: 'Yoga & You', detail: 'A gentle full-body routine for older adults and beginners.', videoId: '7JKinbYMBFQ' },
    ],
  },
] as const

export function HomeWorkoutModal({ onClose }: { onClose: () => void }) {
  const [selectedId, setSelectedId] = useState<(typeof workouts)[number]['id']>('strength')
  const selected = workouts.find((workout) => workout.id === selectedId) ?? workouts[0]

  return createPortal((
    <div className="modal-backdrop home-workout-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="home-workout-modal" role="dialog" aria-modal="true" aria-labelledby="home-workout-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close at-home workouts">×</button>
        <p className="eyebrow">A little movement, right at home</p>
        <h2 id="home-workout-title">What do you want to focus on today?</h2>
        <p className="home-workout-lede">No equipment required! Choose a focus to find a gentle tutorial for active adults 45+.</p>
        <div className="home-workout-categories" role="group" aria-label="Choose a workout focus">
          {workouts.map((workout) => <button key={workout.id} type="button" className={`home-workout-category${selected.id === workout.id ? ' selected' : ''}`} aria-pressed={selected.id === workout.id} onClick={() => setSelectedId(workout.id)}><span aria-hidden="true">{workout.icon}</span>{workout.label}</button>)}
        </div>
        <div className="home-workout-video-list" aria-live="polite" aria-label={`${selected.label} tutorial videos`}>
          {selected.videos.map((video) => <article className="home-workout-video" key={video.videoId}>
            <a className="home-workout-preview" href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noreferrer" aria-label={`Play ${video.title} on YouTube`}>
              <img src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`} alt={`Preview image for ${video.title}`} />
              <span className="home-workout-play" aria-hidden="true">▶</span>
            </a>
            <div className="home-workout-video-copy">
              <span className="home-workout-source">{video.source}</span>
              <h3>{video.title}</h3>
              <p>{video.detail}</p>
              <a className="home-workout-watch" href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noreferrer">Play tutorial <span aria-hidden="true">↗</span></a>
            </div>
          </article>)}
        </div>
        <p className="home-workout-safety">Move at a comfortable pace and use support for standing exercises. Check with a health professional if you’re unsure what’s right for you.</p>
      </section>
    </div>
  ), document.body)
}
