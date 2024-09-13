import { getWeekSummary } from '@/application/use-cases/get-week-summary'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

export async function getWeekSummaryController(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/summary', async () => {
    const { summary } = await getWeekSummary()
    return { summary }
  })
}
