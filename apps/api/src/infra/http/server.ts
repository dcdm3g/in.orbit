import { fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { createGoalController } from './controllers/create-goal'
import { getWeekPendingGoalsController } from './controllers/get-week-pending-goals'

const app = fastify()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(createGoalController)
app.register(getWeekPendingGoalsController)

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP server running!')
})
