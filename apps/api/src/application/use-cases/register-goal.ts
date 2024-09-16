import { db } from '@/infra/db/connection'
import { goals } from '@/infra/db/schema'

type RegisterGoalRequest = {
  title: string
  desiredWeeklyFrequency: number
}

type RegisterGoalReply = {
  goal: {
    title: string
    desiredWeeklyFrequency: number
    id: string
    createdAt: Date
  }
}

export async function registerGoal({
  title,
  desiredWeeklyFrequency,
}: RegisterGoalRequest): Promise<RegisterGoalReply> {
  const [goal] = await db
    .insert(goals)
    .values({ title, desiredWeeklyFrequency })
    .returning()

  return { goal }
}
