import { getWeekPendingGoals } from '@/application/use-cases/get-week-pending-goals'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export async function getWeekPendingGoalsController(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/goals/pending',
    {
      schema: {
        response: {
          200: z.object({
            pendingGoals: z.array(
              z.object({
                id: z.string().cuid2(),
                title: z.string().min(1),
                completionCount: z.number().int().min(0).max(7),
                desiredWeeklyFrequency: z.number().int().min(1).max(7),
              })
            ),
          }),
        },
      },
    },
    async (_, reply) => {
      const { pendingGoals } = await getWeekPendingGoals()
      return reply.status(200).send({ pendingGoals })
    }
  )
}
