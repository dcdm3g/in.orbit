import cors from '@fastify/cors'
import { fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { getWeekPendingGoalsController } from './controllers/get-week-pending-goals'
import { getWeekSummaryController } from './controllers/get-week-summary'
import { registerGoalController } from './controllers/register-goal'
import { registerGoalCompletionController } from './controllers/register-goal-completion'

const app = fastify()

app.register(cors, {
  origin: '*',
})

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(registerGoalController)
app.register(getWeekPendingGoalsController)
app.register(registerGoalCompletionController)
app.register(getWeekSummaryController)

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP server running!')
})
