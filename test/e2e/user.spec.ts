import {
  it,
  beforeAll,
  afterAll,
  describe,
  beforeEach,
  afterEach,
} from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../../src/app'

describe('User routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:latest')
  })

  afterEach(async () => {
    execSync('npm run knex migrate:rollback --all')
  })

  describe('Success', () => {
    it('should be able to create a user', async () => {
      await request(app.server)
        .post('/user')
        .send({
          user: 'Gustavo Henrique',
          password: 'PasSwOrd',
        })
        .expect(201)
    })

    it('should be able to login with a user', async () => {
      const user = 'Gustavo_Henrique'
      const password = 'PasSwOrd'

      await request(app.server)
        .post('/user')
        .send({
          user,
          password,
        })
        .expect(201)

      await request(app.server)
        .post('/user/login')
        .auth(user, password)
        .expect(200)
    })
  })
})
