import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../../../config/env';
import { JwtPayload, Role } from '../../../core/types/auth';

const authSchema = z.object({
  email: z.string().email(),
  role: z.enum(['Admin', 'Pro User', 'Free User']).default('Free User'),
});

export class AuthService {
  createToken(input: unknown): { token: string; user: JwtPayload } {
    const data = authSchema.parse(input);
    const user: JwtPayload = {
      uid: crypto.randomUUID(),
      email: data.email,
      role: data.role as Role,
    };

    return {
      user,
      token: jwt.sign(user, env.jwtSecret, { expiresIn: env.jwtExpiresIn }),
    };
  }
}
