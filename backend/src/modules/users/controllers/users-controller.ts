import { Request, Response } from 'express';

export class UsersController {
  list(_req: Request, res: Response): void {
    res.status(200).json({ module: 'users', message: 'users endpoint is ready for implementation.' });
  }
}
