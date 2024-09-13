import cors from '@fastify/cors'
import { fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { createGoalController } from './controllers/create-goal'
import { createGoalCompletionController } from './controllers/create-goal-completion'
import { getWeekPendingGoalsController } from './controllers/get-week-pending-goals'
import { getWeekSummaryController } from './controllers/get-week-summary'

const app = fastify()

app.register(cors, {
  origin: '*',
})

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(createGoalController)
app.register(getWeekPendingGoalsController)
app.register(createGoalCompletionController)
app.register(getWeekSummaryController)

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP server running!')
})
