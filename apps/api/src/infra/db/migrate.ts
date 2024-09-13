import { env } from '@/env'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

async function execute() {
  const client = postgres(env.DATABASE_URL, { max: 1 })
  const db = drizzle(client)

  await migrate(db, { migrationsFolder: 'drizzle' })
  await client.end()

  process.exit()
}

execute()
