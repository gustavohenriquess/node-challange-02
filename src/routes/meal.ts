import { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function mealRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const mealBodySchema = z.object({
      name: z.string().min(1),
      description: z.string().min(1).optional(),
      dateTime: z.preprocess((arg) => {
        if (typeof arg === 'number' || arg instanceof Date) return new Date(arg)
      }, z.date()),
      inDiet: z.boolean(),
    })
    const { name, description, dateTime, inDiet } = mealBodySchema.parse(
      request.body,
    )

    console.log(name, description, dateTime, inDiet)

    return reply.status(201).send()
  })

  app.get('/', async (request, reply) => {
    return reply.status(200).send({
      total: 1,
      meals: [
        {
          name: 'Meal 1',
          description: 'Meal 1 description',
          dateTime: new Date(),
          inDiet: true,
        },
      ],
    })
  })

  app.get('/:id', async (request, reply) => {
    return reply.status(200).send({
      meal: {
        name: 'Meal 2',
        description: 'Meal 2 description',
        dateTime: new Date(),
        inDiet: true,
      },
    })
  })

  app.put('/:id', async (request, reply) => {
    const mealBodySchema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      dateTime: z
        .preprocess((arg) => {
          if (typeof arg === 'number' || arg instanceof Date)
            return new Date(arg)
        }, z.date())
        .optional(),
      inDiet: z.boolean().optional(),
    })

    const { name, description, dateTime, inDiet } = mealBodySchema.parse(
      request.body,
    )

    console.log(name, description, dateTime, inDiet)

    return reply.status(204).send()
  })

  app.delete('/:id', async (request, reply) => {
    return reply.status(204).send()
  })

  app.get('/metrics', async (request, reply) => {
    return reply.status(200).send({
      total: 3,
      totalInDiet: 2,
      totalOffDiet: 1,
      betterSquence: 2,
    })
  })
}
