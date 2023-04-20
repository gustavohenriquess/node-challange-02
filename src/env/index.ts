import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  PORT: z.coerce.number().default(3333),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error(
    '🚨 Environment variables are not valid! 🚨',
    _env.error.format(),
    '\n\n',
  )
  throw new Error('🚨 Environment variables are not valid!🚨')
}

export const env = _env.data
