import { goalCompletions, goals } from '@/infra/db/schema'
import { addDays, startOfWeek } from 'date-fns'
import { client, db } from './connection'

async function execute() {
  await db.delete(goals)

  const insertedGoals = await db
    .insert(goals)
    .values([
      { title: 'Wake up early', desiredWeeklyFrequency: 5 },
      { title: 'Exercise', desiredWeeklyFrequency: 3 },
      { title: 'Meditate', desiredWeeklyFrequency: 1 },
    ])
    .returning()

  const now = new Date()
  const startOfThisWeek = startOfWeek(now)

  await db.insert(goalCompletions).values([
    { goalId: insertedGoals[0].id, createdAt: startOfThisWeek },
    { goalId: insertedGoals[1].id, createdAt: now },
  ])

  client.end()
}

execute()
