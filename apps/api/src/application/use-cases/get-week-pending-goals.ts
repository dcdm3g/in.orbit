import { db } from '@/infra/db/connection'
import { goalCompletions, goals } from '@/infra/db/schema'
import { endOfWeek, startOfWeek } from 'date-fns'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'

export async function getWeekPendingGoals() {
  const now = new Date()

  const startOfThisWeek = startOfWeek(now)
  const endOfThisWeek = endOfWeek(now)

  const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, endOfThisWeek))
  )

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
          lte(goalCompletions.createdAt, endOfThisWeek)
        )
      )
      .groupBy(goalCompletions.goalId)
  )

  const pendingGoals = await db
    .with(goalsCreatedUpToWeek, goalCompletionsCount)
    .select({
      id: goalsCreatedUpToWeek.id,
      title: goalsCreatedUpToWeek.title,
      desiredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
      completionCount: sql`
        coalesce(${goalCompletionsCount.completionCount}, 0)
      `.mapWith(Number),
    })
    .from(goalsCreatedUpToWeek)
    .leftJoin(
      goalCompletionsCount,
      eq(goalCompletionsCount.goalId, goalsCreatedUpToWeek.id)
    )

  return { pendingGoals }
}
