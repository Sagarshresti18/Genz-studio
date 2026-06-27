import { Request, Response } from 'express';

export class SubscriptionController {
  list(_req: Request, res: Response): void {
    res.status(200).json({ module: 'subscription', message: 'subscription endpoint is ready for implementation.' });
  }
}
