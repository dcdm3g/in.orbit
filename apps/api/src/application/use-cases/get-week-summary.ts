import { db } from '@/infra/db/connection'
import { goalCompletions, goals } from '@/infra/db/schema'
import { endOfWeek, startOfWeek } from 'date-fns'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'

export async function getWeekSummary() {
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

  const goalsCompletedInWeek = db.$with('goal_completion_count').as(
    db
      .select({
        id: goalCompletions.id,
        title: goals.title,
        completedAt: goalCompletions.createdAt,
        completedAtDate: sql`date(${goalCompletions.createdAt})`.as(
          'completed_at_date'
        ),
      })
      .from(goalCompletions)
      .innerJoin(goals, eq(goals.id, goalCompletions.goalId))
      .where(
        and(
          gte(goalCompletions.createdAt, startOfThisWeek),
          lte(goalCompletions.createdAt, endOfThisWeek)
        )
      )
  )

  const goalsCompletedByWeekDay = db.$with('goals_completed_by_week_day').as(
    db
      .select({
        completedAtDate: goalsCompletedInWeek.completedAtDate,
        completions: sql`
            json_agg(
              json_build_object(
                'id', ${goalsCompletedInWeek.id},
                'title', ${goalsCompletedInWeek.title},
                'completedAt', ${goalsCompletedInWeek.completedAt}
              )
            )
          `.as('completions'),
      })
      .from(goalsCompletedInWeek)
      .groupBy(goalsCompletedInWeek.completedAtDate)
  )

  const summary = await db
    .with(goalsCreatedUpToWeek, goalsCompletedInWeek, goalsCompletedByWeekDay)
    .select({
      completed: sql`(select count(*) from ${goalsCompletedInWeek})`.mapWith(
        Number
      ),
      total:
        sql`(select sum(${goalsCreatedUpToWeek.desiredWeeklyFrequency}) from ${goalsCreatedUpToWeek})`.mapWith(
          Number
        ),
      goalsPerDay: sql`
        json_object_agg(
          ${goalsCompletedByWeekDay.completedAtDate},
          ${goalsCompletedByWeekDay.completions}
        )
      `,
    })
    .from(goalsCompletedByWeekDay)

  return { summary }
}
