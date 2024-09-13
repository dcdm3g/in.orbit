import { db } from '@/infra/db/connection'
import { goals } from '@/infra/db/schema'

interface CreateGoalParams {
  title: string
  desiredWeeklyFrequency: number
}

export async function createGoal({
  title,
  desiredWeeklyFrequency,
}: CreateGoalParams) {
  const [goal] = await db
    .insert(goals)
    .values({ title, desiredWeeklyFrequency })
    .returning()

  return { goal }
}
