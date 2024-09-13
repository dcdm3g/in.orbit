import { createGoalCompletion } from '@/application/use-cases/create-goal-completion'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function createGoalCompletionController(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/completions',
    {
      schema: {
        body: z.object({ goalId: z.string().cuid2() }),
      },
    },
    async (request, reply) => {
      const { goalId } = request.body
      const { goalCompletion } = await createGoalCompletion({ goalId })

      return reply.status(201).send({ goalCompletion })
    }
  )
}
