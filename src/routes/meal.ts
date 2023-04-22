import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { checkUserPermission } from '../middlewares/check-user-permission'

export async function mealRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [checkUserPermission],
    },
    async (request, reply) => {
      const mealBodySchema = z.object({
        name: z.string().min(1),
        description: z.string().min(1).optional(),
        dateTime: z.preprocess((arg) => {
          if (typeof arg === 'number' || arg instanceof Date)
            return new Date(arg)
        }, z.date()),
        inDiet: z.boolean(),
      })
      const { name, description, dateTime, inDiet } = mealBodySchema.parse(
        request.body,
      )

      console.log(name, description, dateTime, inDiet)

      return reply.status(201).send()
    },
  )

  app.get(
    '/',
    {
      preHandler: [checkUserPermission],
    },
    async (request, reply) => {
      return reply.status(200).send({
        total: 1,
        meals: [
          {
            id: '881eaed4-6eaf-45a6-801c-f443d1f5f4d2',
            name: 'New Meal',
            description: 'Description',
            dateTime: new Date(),
            inDiet: true,
          },
        ],
      })
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkUserPermission],
    },
    async (request, reply) => {
      return reply.status(200).send({
        meal: {
          id: '881eaed4-6eaf-45a6-801c-f443d1f5f4d2',
          name: 'New Meal',
          description: 'Description',
          dateTime: new Date(),
          inDiet: true,
        },
      })
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [checkUserPermission],
    },
    async (request, reply) => {
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
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkUserPermission],
    },
    async (request, reply) => {
      return reply.status(204).send()
    },
  )

  app.get(
    '/metrics',
    {
      preHandler: [checkUserPermission],
    },
    async (request, reply) => {
      return reply.status(200).send({
        total: 3,
        totalInDiet: 2,
        totalOffDiet: 1,
        betterSequence: 2,
      })
    },
  )
}
