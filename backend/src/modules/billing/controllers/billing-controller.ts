import { Request, Response } from 'express';

export class BillingController {
  list(_req: Request, res: Response): void {
    res.status(200).json({ module: 'billing', message: 'billing endpoint is ready for implementation.' });
  }
}
