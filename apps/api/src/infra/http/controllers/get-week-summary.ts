import { getWeekSummary } from '@/application/use-cases/get-week-summary'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export async function getWeekSummaryController(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/summary',
    {
      schema: {
        response: {
          200: z.object({
            summary: z.object({
              completed: z.number().int().nonnegative(),
              total: z.number().int().nonnegative(),
              goalsPerDay: z
                .record(
                  z.string(),
                  z.array(
                    z.object({
                      id: z.string().cuid2(),
                      title: z.string().min(1),
                      completedAt: z.string(),
                    })
                  )
                )
                .nullable(),
            }),
          }),
        },
      },
    },
    async (_, reply) => {
      const { summary } = await getWeekSummary()
      return reply.status(200).send({ summary })
    }
  )
}
