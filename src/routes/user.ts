import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function userRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const userBodySchema = z.object({
      user: z.string().min(1),
      password: z.string().min(6),
    })

    const { user, password } = userBodySchema.parse(request.body)

    await knex('users').insert({
      user,
      password,
    })

    return reply.status(201).send()
  })

  app.post('/login', async (request, reply) => {
    const loginBodySchema = z.object({
      username: z.string().min(1),
      password: z.string().min(6),
    })

    const hash = Buffer.from(
      request.headers.authorization?.split(' ')[1] || ``,
      'base64',
    ).toString()
    const access = hash.split(':')
    const accessLogin = {
      username: access[0],
      password: access[1],
    }

    const { username, password } = loginBodySchema.parse(accessLogin)

    const user = await knex('users')
      .where({
        user: username,
        password,
      })
      .first()

    if (!user)
      return reply
        .status(401)
        .send({ error: 401, message: 'Invalid credentials' })

    const sessionId = randomUUID()

    await knex('users').where({ user: username }).update({
      sessionId,
    })

    reply.setCookie('sessionId', sessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    return reply.status(200).send()
  })
}
