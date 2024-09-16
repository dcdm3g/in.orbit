import { registerGoalCompletion } from '@/application/use-cases/register-goal-completion'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function registerGoalCompletionController(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/completions',
    {
      schema: {
        body: z.object({ goalId: z.string().cuid2() }),
        response: {
          403: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
          201: z.object({
            goalCompletion: z.object({
              goalId: z.string().cuid2(),
              id: z.string().cuid2(),
              createdAt: z.date(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const result = await registerGoalCompletion({
        goalId: request.body.goalId,
      })

      if (result.kind === 'failure') {
        return result.error === 'GOAL_NOT_FOUND'
          ? reply.status(404).send({ message: result.message })
          : reply.status(403).send({ message: result.message })
      }

      return reply.status(201).send(result.data)
    }
  )
}
