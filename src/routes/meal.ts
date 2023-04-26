import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { checkUserPermission } from '../middlewares/check-user-permission'
import { knex } from '../database'
import { randomUUID } from 'crypto'

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
        userId: z.string(),
      })

      const { name, description, dateTime, inDiet, userId } =
        mealBodySchema.parse(request.body)

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        dateTime,
        inDiet,
        userId,
      })

      return reply.status(201).send()
    },
  )

  app.get(
    '/',
    {
      preHandler: [checkUserPermission],
    },
    async (request, reply) => {
      const body = request.body as Record<string, unknown>
      const meals = await knex('meals').where({ userId: body.userId }).select()

      return reply.status(200).send({
        total: meals.length,
        meals,
      })
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkUserPermission],
    },
    async (request, reply) => {
      const mealBodySchema = z.object({
        userId: z.string(),
      })

      const mealParamsSchema = z.object({
        id: z.string(),
      })

      const { userId } = mealBodySchema.parse(request.body)
      const { id } = mealParamsSchema.parse(request.params)

      const meal = await knex('meals').where({ id, userId }).first()

      return reply.status(200).send({ meal })
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
        userId: z.string(),
      })

      const mealParamsSchema = z.object({
        id: z.string(),
      })

      const { name, description, dateTime, inDiet } = mealBodySchema.parse(
        request.body,
      )
      const { id } = mealParamsSchema.parse(request.params)

      await knex('meals')
        .where({ id })
        .update({ name, description, dateTime, inDiet, updatedAt: new Date() })

      return reply.status(204).send()
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkUserPermission],
    },
    async (request, reply) => {
      const mealBodySchema = z.object({
        userId: z.string(),
      })

      const mealParamsSchema = z.object({
        id: z.string(),
      })

      const { userId } = mealBodySchema.parse(request.body)
      const { id } = mealParamsSchema.parse(request.params)

      await knex('meals').where({ id, userId }).delete()

      return reply.status(204).send()
    },
  )

  app.get(
    '/metrics',
    {
      preHandler: [checkUserPermission],
    },
    async (request, reply) => {
      const mealBodySchema = z.object({
        userId: z.string(),
      })

      const { userId } = mealBodySchema.parse(request.body)

      const total: any = await knex('meals').where({ userId }).count().first()
      const totalInDiet: any = await knex('meals')
        .where({ userId, inDiet: true })
        .count()
        .first()

      const totalKeys = Object.keys(total as Object)
      const totalInDietKeys = Object.keys(totalInDiet as Object)
      const totalOffDiet = total[totalKeys[0]] - totalInDiet[totalInDietKeys[0]]

      const betterSequence = []
      const meals = await knex('meals').where({ userId }).select()
      let counter = 0

      for (const i in meals) {
        if (meals[i].inDiet) {
          counter++
        } else {
          betterSequence.push(counter)
          counter = 0
        }

        if (Number(i) === meals.length - 1) {
          betterSequence.push(counter)
        }
      }

      return reply.status(200).send({
        total: total[totalKeys[0]],
        totalInDiet: totalInDiet[totalInDietKeys[0]],
        totalOffDiet,
        betterSequence: Math.max(...betterSequence),
      })
    },
  )
}
