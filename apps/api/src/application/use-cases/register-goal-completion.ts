import type { Result } from '@/application/result'
import { db } from '@/infra/db/connection'
import { goalCompletions, goals } from '@/infra/db/schema'
import { endOfWeek, startOfWeek } from 'date-fns'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'

type RegisterGoalCompletionRequest = {
  goalId: string
}

type RegisterGoalCompletionReply = Result<
  {
    goalCompletion: {
      goalId: string
      id: string
      createdAt: Date
    }
  },
  'GOAL_NOT_FOUND' | 'GOAL_ALREADY_COMPLETED'
>

export async function registerGoalCompletion({
  goalId,
}: RegisterGoalCompletionRequest): Promise<RegisterGoalCompletionReply> {
  const now = new Date()
  const startOfThisWeek = startOfWeek(now)
  const endOfThisWeek = endOfWeek(now)

  const [goal] = await db.select().from(goals).where(eq(goals.id, goalId))

  if (!goal) {
    return {
      kind: 'failure',
      error: 'GOAL_NOT_FOUND',
      message: "Sorry, couldn't found that goal.",
    }
  }

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

  const [result] = await db
    .with(goalCompletionsCount)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completionCount: sql`
        coalesce(${goalCompletionsCount.completionCount}, 0)
      `.mapWith(Number),
    })
    .from(goals)
    .where(eq(goals.id, goalId))
    .leftJoin(goalCompletionsCount, eq(goalCompletionsCount.goalId, goals.id))
    .limit(1)

  const { completionCount, desiredWeeklyFrequency } = result

  if (completionCount >= desiredWeeklyFrequency) {
    return {
      kind: 'failure',
      error: 'GOAL_ALREADY_COMPLETED',
      message: "You've already achieved this goal.",
    }
  }

  const [goalCompletion] = await db
    .insert(goalCompletions)
    .values({ goalId })
    .returning()

  return { kind: 'success', data: { goalCompletion } }
}
