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

// Coerce empty strings to undefined so optional() works correctly
const optionalStr = z.string().trim().transform(v => v === '' ? undefined : v).optional();

const envSchema = z.object({
  NODE_ENV:          z.enum(['development', 'test', 'production']).default('development'),
  PORT:              z.coerce.number().int().positive().default(8080),
  JWT_SECRET:        z.string().trim().default('genz-studio-dev-secret-change-in-prod'),
  JWT_REFRESH_SECRET:z.string().trim().default('genz-studio-dev-refresh-change-in-prod'),
  DATABASE_URL:      optionalStr,
  OPENAI_API_KEY:    optionalStr,
  STABILITY_API_KEY: optionalStr,
  GEMINI_API_KEY:    optionalStr,
  IMGFLIP_USERNAME:  optionalStr,
  IMGFLIP_PASSWORD:  optionalStr,
});

const parsedEnv = envSchema.parse(process.env);
const env = { ...parsedEnv };

module.exports = { env };