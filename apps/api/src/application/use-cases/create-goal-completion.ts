import { db } from '@/infra/db/connection'
import { goalCompletions, goals } from '@/infra/db/schema'
import { endOfWeek, startOfWeek } from 'date-fns'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'

interface CreateGoalCompletionParams {
  goalId: string
}

export async function createGoalCompletion({
  goalId,
}: CreateGoalCompletionParams) {
  const now = new Date()

  const startOfThisWeek = startOfWeek(now)
  const endOfThisWeek = endOfWeek(now)

  const goalCompletionsCount = db.$with('goal_completion_count').as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as('completion_count'),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createdAt, startOfThisWeek),
          lte(goalCompletions.createdAt, endOfThisWeek),
          eq(goalCompletions.goalId, goalId)
        )
      )
      .groupBy(goalCompletions.goalId)
  )

  const result = await db
    .with(goalCompletionsCount)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completionCount: sql`
        COALESCE(${goalCompletionsCount.completionCount}, 0)
      `.mapWith(Number),
    })
    .from(goals)
    .where(eq(goals.id, goalId))
    .leftJoin(goalCompletionsCount, eq(goalCompletionsCount.goalId, goals.id))
    .limit(1)

  const { completionCount, desiredWeeklyFrequency } = result[0]

  if (completionCount >= desiredWeeklyFrequency) {
    throw new Error('Goal already completed this week.')
  }

  const insertResult = await db
    .insert(goalCompletions)
    .values({ goalId })
    .returning()
  const [goalCompletion] = insertResult

  return { goalCompletion }
}
