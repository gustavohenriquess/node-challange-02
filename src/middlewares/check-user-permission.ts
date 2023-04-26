import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

export async function checkUserPermission(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    return reply.status(401).send({
      status: 401,
      message: 'Unauthorized',
    })
  }

  const user = await knex('users').where({ sessionId }).first()
  const expired = new Date(user.expireIn).getTime() < new Date().getTime()

  if (!user || expired) {
    return reply.status(401).send({
      status: 401,
      message: 'Unauthorized',
    })
  }

  request.body = {
    userId: user.id,
    ...(request.body as Record<string, unknown>),
  }
}
