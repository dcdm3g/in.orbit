import { createGoal } from '@/application/use-cases/create-goal'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export async function createGoalController(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/goals',
    {
      schema: {
        body: z.object({
          title: z.string().trim().min(1),
          desiredWeeklyFrequency: z.number().int().min(1).max(7),
        }),
        response: {
          201: z.object({
            goal: z.object({
              id: z.string().cuid2(),
              title: z.string().min(1),
              desiredWeeklyFrequency: z.number().int().min(1).max(7),
              createdAt: z.date(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { title, desiredWeeklyFrequency } = request.body
      const { goal } = await createGoal({ title, desiredWeeklyFrequency })

      return reply.status(201).send({ goal })
    }
  )
}
