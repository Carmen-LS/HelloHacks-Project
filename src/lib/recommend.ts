import { activities, type Activity, type Category, type Difficulty, type Goal } from '../data/activities'
import type { Profile } from './profile'

const difficultyRank: Record<Difficulty, number> = {
  gentle: 0,
  steady: 1,
  challenging: 2,
}

export type RankedActivity = Activity & { score: number; reasons: string[] }

export function recommend(profile: Profile): RankedActivity[] {
  const preferred = new Set<Category>(profile.categories)
  const goals = new Set<Goal>(profile.goals)
  const cap = difficultyRank[profile.difficulty]

  return activities
    .map((activity) => {
      const reasons: string[] = []
      let score = 0

      const matchedGoals = activity.goals.filter((goal) => goals.has(goal))
      if (matchedGoals.length) {
        score += matchedGoals.length * 3
        reasons.push(`Matches ${matchedGoals.length} of your goals`)
      }

      if (preferred.has(activity.category)) {
        score += 2
        reasons.push('Fits the settings you chose')
      }

      const gap = difficultyRank[activity.difficulty] - cap
      if (gap <= 0) {
        score += 2
        if (activity.difficulty === profile.difficulty) {
          reasons.push(`At your ${profile.difficulty} pace`)
        } else {
          reasons.push('A comfortable starting level')
        }
      } else if (gap === 1) {
        score += 0
        reasons.push('A small step up from your selected level')
      } else {
        score -= 3
      }

      if (profile.ageRange === '75+' && activity.difficulty === 'challenging') {
        score -= 1
      }

      return { ...activity, score, reasons }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
}
