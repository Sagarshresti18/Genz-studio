import { Request, Response } from 'express';

export class AdminController {
  list(_req: Request, res: Response): void {
    res.status(200).json({ module: 'admin', message: 'admin endpoint is ready for implementation.' });
  }
}
