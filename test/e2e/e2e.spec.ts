import {
  it,
  beforeAll,
  afterAll,
  describe,
  beforeEach,
  afterEach,
  expect,
} from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../../src/app'

beforeAll(async () => {
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

describe('User routes', () => {
  const user = 'Gustavo_Henrique'
  const password = 'PasSwOrd'

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
          user,
          password,
        })
        .expect(201)
    })

    it('should be able to login with a user', async () => {
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

  describe('Fail', () => {
    it('shouldn`t be able to create a user', async () => {
      await request(app.server)
        .post('/user')
        .send({
          user: 'Gustavo Henrique',
        })
        .expect(500)
    })

    it('shouldn`t be able to login with a user', async () => {
      const loginResponse = await request(app.server)
        .post('/user/login')
        .auth(user, password)
        .expect(401)

      expect(loginResponse.body).toEqual(
        expect.objectContaining({ error: 401, message: 'Invalid credentials' }),
      )
    })
  })
})

describe('Meals routes', () => {
  const user = 'Gustavo_Henrique'
  const password = 'PasSwOrd'
  let cookies: string

  beforeEach(async () => {
    execSync('npm run knex migrate:latest')

    await request(app.server).post('/user').send({
      user,
      password,
    })

    const userLoginResponse = await request(app.server)
      .post('/user/login')
      .auth(user, password)
      .expect(200)

    cookies = userLoginResponse.get('set-cookie')
  })

  afterEach(async () => {
    execSync('npm run knex migrate:rollback --all')
  })

  describe('Success', () => {
    it('should be able to create a new meal', async () => {
      await request(app.server)
        .post('/meals')
        .set('Cookie', cookies)
        .send({
          name: 'New Meal',
          description: 'Description',
          dateTime: new Date().getTime(),
          inDiet: true,
        })
        .expect(201)
    })

    interface Meal {
      name: string
      description: string
      dateTime?: number
      inDiet?: boolean
    }

    it('should be able to list all meals', async () => {
      const meal: Meal = {
        name: 'New Meal',
        description: 'Description',
        dateTime: new Date().getTime(),
        inDiet: true,
      }

      await request(app.server)
        .post('/meals')
        .set('Cookie', cookies)
        .send(meal)
        .expect(201)

      const mealsResponse = await request(app.server)
        .get('/meals')
        .set('Cookie', cookies)
        .expect(200)

      delete meal.inDiet

      expect(mealsResponse.body.meals).toEqual([expect.objectContaining(meal)])
    })

    it('should be able to list a specific meal', async () => {
      const meal: Meal = {
        name: 'New Meal',
        description: 'Description',
        dateTime: new Date().getTime(),
        inDiet: true,
      }

      await request(app.server)
        .post('/meals')
        .set('Cookie', cookies)
        .send(meal)
        .expect(201)

      const mealsResponse = await request(app.server)
        .get('/meals')
        .set('Cookie', cookies)
        .expect(200)

      const mealId = mealsResponse.body.meals[0].id

      const specificMealResponse = await request(app.server)
        .get(`/meals/${mealId}`)
        .set('Cookie', cookies)
        .expect(200)

      delete meal.inDiet
      delete meal.dateTime
      expect(specificMealResponse.body.meal).toEqual(
        expect.objectContaining(meal),
      )
    })

    it('should be able to update a specific meal', async () => {
      await request(app.server)
        .post('/meals')
        .set('Cookie', cookies)
        .send({
          name: 'New Meal',
          description: 'Description',
          dateTime: new Date().getTime(),
          inDiet: true,
        })
        .expect(201)

      const mealsResponse = await request(app.server)
        .get('/meals')
        .set('Cookie', cookies)
        .expect(200)

      const mealId = mealsResponse.body.meals[0].id

      await request(app.server)
        .put(`/meals/${mealId}`)
        .set('Cookie', cookies)
        .send({
          name: 'New Meal Updated',
          description: 'Description Updated',
        })
        .expect(204)
    })

    it('should be able to delete a specific meal', async () => {
      await request(app.server)
        .post('/meals')
        .set('Cookie', cookies)
        .send({
          name: 'New Meal',
          description: 'Description',
          dateTime: new Date().getTime(),
          inDiet: true,
        })
        .expect(201)

      const mealsResponse = await request(app.server)
        .get('/meals')
        .set('Cookie', cookies)
        .expect(200)

      const mealId = mealsResponse.body.meals[0].id

      await request(app.server)
        .delete(`/meals/${mealId}`)
        .set('Cookie', cookies)
        .expect(204)
    })

    it('should be able to get user metrics', async () => {
      await Promise.all([
        request(app.server)
          .post('/meals')
          .set('Cookie', cookies)
          .send({
            name: 'New Meal',
            description: 'Description',
            dateTime: new Date().getTime(),
            inDiet: false,
          })
          .expect(201),
        request(app.server)
          .post('/meals')
          .set('Cookie', cookies)
          .send({
            name: 'Healthy Meal - 1',
            description: 'Description',
            dateTime: new Date().getTime(),
            inDiet: true,
          })
          .expect(201),
        request(app.server)
          .post('/meals')
          .set('Cookie', cookies)
          .send({
            name: 'Healthy Meal - 2',
            description: 'Description',
            dateTime: new Date().getTime(),
            inDiet: true,
          })
          .expect(201),
      ])
      const metricsResponse = await request(app.server)
        .get(`/meals/metrics`)
        .set('Cookie', cookies)
        .expect(200)

      expect(metricsResponse.body).toEqual(
        expect.objectContaining({
          total: 3,
          totalInDiet: 2,
          totalOffDiet: 1,
          betterSequence: 2,
        }),
      )
    })
  })
})
