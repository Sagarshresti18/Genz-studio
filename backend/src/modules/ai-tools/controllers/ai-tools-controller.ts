import { Request, Response } from 'express';

export class AiToolsController {
  list(_req: Request, res: Response): void {
    res.status(200).json({ module: 'ai-tools', message: 'ai-tools endpoint is ready for implementation.' });
  }
}
