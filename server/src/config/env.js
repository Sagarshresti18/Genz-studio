const { existsSync } = require('node:fs');
const { resolve } = require('node:path');

const dotenv = require('dotenv');
const { z } = require('zod');

const rootEnvPath = resolve(process.cwd(), '..', '.env');
const localEnvPath = resolve(process.cwd(), '.env');

if (existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}

if (existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.string().trim().min(1).optional(),
});

const parsedEnv = envSchema.parse(process.env);

const env = {
  ...parsedEnv,
  DATABASE_URL: parsedEnv.DATABASE_URL,
};

module.exports = { env };