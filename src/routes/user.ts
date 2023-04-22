import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function userRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const userBodySchema = z.object({
      user: z.string().min(1),
      password: z.string().min(6),
    })

    const { user, password } = userBodySchema.parse(request.body)

    console.log('CREATE USER', user, password)

    return reply.status(201).send()
  })

  app.post('/login', async (request, reply) => {
    const loginBodySchema = z.object({
      user: z.string().min(1),
      password: z.string().min(6),
    })

    const hash = Buffer.from(
      request.headers.authorization?.split(' ')[1] || ``,
      'base64',
    ).toString()
    const access = hash.split(':')
    const accessLogin = {
      user: access[0],
      password: access[1],
    }

    const { user, password } = loginBodySchema.parse(accessLogin)

    console.log('LOGIN USER', user, password)

    if (user !== 'Gustavo_Henrique' || password !== 'PasSwOrd')
      return reply.status(401).send({ error: 'Invalid credentials' })

    const sessionId = randomUUID()

    reply.setCookie('sessionId', sessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    return reply.status(200).send()
  })
}
