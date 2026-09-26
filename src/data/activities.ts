import type { Place } from './places'

export type Category = 'gym' | 'sport' | 'outdoor'
export type Goal = 'strength' | 'mobility' | 'balance' | 'cardio' | 'stairs' | 'daily-tasks'
export type Difficulty = 'gentle' | 'steady' | 'challenging'

export type Activity = {
  id: string
  name: string
  category: Category
  goals: Goal[]
  difficulty: Difficulty
  description: string
  whyItHelps: string
  placeIds: string[]
}

export const categoryLabels: Record<Category, string> = {
  gym: 'Gym activities',
  sport: 'Sports',
  outdoor: 'Outside activities',
}

export const goalLabels: Record<Goal, string> = {
  strength: 'Stay strong',
  mobility: 'Move more easily',
  balance: 'Steady balance',
  cardio: 'Heart & stamina',
  stairs: 'Stairs & hills',
  'daily-tasks': 'Everyday tasks (lifting, bending)',
}

export const difficultyLabels: Record<Difficulty, string> = {
  gentle: 'Gentle',
  steady: 'Steady',
  challenging: 'Challenging',
}

export const activityIcons: Record<string, string> = {
  'strength-machines': '🏋️',
  'free-weights': '🏋️',
  'cardio-floor': '🚴',
  'mobility-studio': '🧘',
  'balance-class': '🧍',
  'aqua-fitness': '🏊',
  tennis: '🎾',
  pickleball: '🏓',
  badminton: '🏸',
  golf: '⛳',
  'track-walk': '🚶',
  'seawall-walk': '🚶',
  'forest-hike': '🥾',
  'hill-walk': '🌿',
  'park-mobility': '🌳',
}

export const activities: Activity[] = [
  {
    id: 'strength-machines',
    name: 'Strength machines',
    category: 'gym',
    goals: ['strength', 'daily-tasks', 'stairs'],
    difficulty: 'steady',
    description:
      'Guided machine work for legs, back, and arms. Good if free weights feel intimidating.',
    whyItHelps: 'Builds the strength used for carrying groceries and standing from a chair.',
    placeIds: ['wpgcc', 'src', 'arc', 'rec-north', 'dunbar-cc'],
  },
  {
    id: 'free-weights',
    name: 'Light lifting',
    category: 'gym',
    goals: ['strength', 'daily-tasks'],
    difficulty: 'steady',
    description: 'Dumbbells or kettlebells with simple, repeatable patterns.',
    whyItHelps: 'Mirrors picking things up safely and keeping bone-loading in the routine.',
    placeIds: ['wpgcc', 'src', 'arc', 'rec-north'],
  },
  {
    id: 'cardio-floor',
    name: 'Cardio floor (bike, rower, elliptical)',
    category: 'gym',
    goals: ['cardio', 'stairs'],
    difficulty: 'gentle',
    description: 'Low-impact machines you can start slow and build from.',
    whyItHelps: 'Supports walking stamina without pounding the joints.',
    placeIds: ['wpgcc', 'src', 'arc', 'rec-north', 'dunbar-cc'],
  },
  {
    id: 'mobility-studio',
    name: 'Mobility & stretching studio',
    category: 'gym',
    goals: ['mobility', 'balance', 'daily-tasks'],
    difficulty: 'gentle',
    description: 'Floor or chair-supported stretching and joint range-of-motion work.',
    whyItHelps: 'Makes bending, reaching, and getting up from the floor feel more manageable.',
    placeIds: ['wpgcc', 'src', 'arc', 'rec-north'],
  },
  {
    id: 'balance-class',
    name: 'Balance-friendly fitness class',
    category: 'gym',
    goals: ['balance', 'strength', 'stairs'],
    difficulty: 'gentle',
    description: 'Community-centre style class focused on standing stability and leg strength.',
    whyItHelps: 'Practice the small stance changes used on stairs and uneven sidewalks.',
    placeIds: ['wpgcc', 'dunbar-cc', 'kerrisdale-cc'],
  },
  {
    id: 'aqua-fitness',
    name: 'Aqua fitness / easy swim',
    category: 'gym',
    goals: ['cardio', 'mobility', 'strength'],
    difficulty: 'gentle',
    description: 'Water supports the body while you walk, kick, or take a class.',
    whyItHelps: 'Builds stamina and strength with less load on knees and hips.',
    placeIds: ['aquatic', 'kerrisdale-cc'],
  },
  {
    id: 'tennis',
    name: 'Tennis',
    category: 'sport',
    goals: ['cardio', 'balance', 'mobility'],
    difficulty: 'steady',
    description: 'Singles or doubles. Doubles is a friendlier entry if you want less running.',
    whyItHelps: 'Side-to-side movement and reaching support agility and reaction.',
    placeIds: ['tennis', 'jericho'],
  },
  {
    id: 'pickleball',
    name: 'Pickleball',
    category: 'sport',
    goals: ['cardio', 'balance', 'mobility'],
    difficulty: 'gentle',
    description: 'Smaller court, social drop-ins, and a lower barrier than tennis for many people.',
    whyItHelps: 'Keeps feet moving and adds light competition without a full gym session.',
    placeIds: ['wpgcc', 'dunbar-cc'],
  },
  {
    id: 'badminton',
    name: 'Badminton',
    category: 'sport',
    goals: ['cardio', 'balance', 'mobility'],
    difficulty: 'steady',
    description: 'Indoor court sport with easy start-stop pacing.',
    whyItHelps: 'Reaching and short bursts help shoulders and footwork.',
    placeIds: ['wpgcc', 'src', 'war-memorial'],
  },
  {
    id: 'golf',
    name: 'Golf',
    category: 'sport',
    goals: ['mobility', 'balance', 'cardio'],
    difficulty: 'gentle',
    description: 'Walking the course or using a cart; focus on rotation and an easy outdoor day.',
    whyItHelps: 'Walking plus rotational mobility without a high-intensity feel.',
    placeIds: ['ubc-golf'],
  },
  {
    id: 'track-walk',
    name: 'Track walking',
    category: 'sport',
    goals: ['cardio', 'stairs', 'balance'],
    difficulty: 'gentle',
    description: 'Flat, predictable loops at Thunderbird Park — useful if trails feel uneven.',
    whyItHelps: 'Builds walking confidence on a measured, even surface.',
    placeIds: ['thunderbird'],
  },
  {
    id: 'seawall-walk',
    name: 'Seawall & beach walk',
    category: 'outdoor',
    goals: ['cardio', 'balance', 'mobility'],
    difficulty: 'gentle',
    description: 'Jericho, Locarno, and Spanish Banks paths with benches and wide paving.',
    whyItHelps: 'Everyday walking practice with scenery and places to rest.',
    placeIds: ['jericho', 'locarno', 'spanish-banks'],
  },
  {
    id: 'forest-hike',
    name: 'Pacific Spirit trail walk',
    category: 'outdoor',
    goals: ['stairs', 'balance', 'cardio'],
    difficulty: 'steady',
    description: 'Start on wider park loops. Roots and gentle hills come later if you want them.',
    whyItHelps: 'Uneven ground trains ankles, hips, and the same muscles used on stairs.',
    placeIds: ['pacific-spirit'],
  },
  {
    id: 'hill-walk',
    name: 'Campus hill walk',
    category: 'outdoor',
    goals: ['stairs', 'cardio', 'strength'],
    difficulty: 'challenging',
    description: 'Short loops around UBC with natural grades instead of a stair machine.',
    whyItHelps: 'Directly practices going up and down with rest options nearby.',
    placeIds: ['src', 'thunderbird', 'aquatic'],
  },
  {
    id: 'park-mobility',
    name: 'Park mobility circuit',
    category: 'outdoor',
    goals: ['mobility', 'daily-tasks', 'balance'],
    difficulty: 'gentle',
    description: 'Benches for sit-to-stand, light reaching, and easy standing balance near the beach.',
    whyItHelps: 'Turns a walk into practice for getting up, bending, and standing tall.',
    placeIds: ['jericho', 'locarno', 'wpgcc'],
  },
]

export function placesForActivity(activity: Activity, allPlaces: Place[]) {
  return allPlaces.filter((place) => activity.placeIds.includes(place.id))
}
