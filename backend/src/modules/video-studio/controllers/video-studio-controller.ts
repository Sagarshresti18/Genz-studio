import { Request, Response } from 'express';

export class VideoStudioController {
  list(_req: Request, res: Response): void {
    res.status(200).json({ module: 'video-studio', message: 'video-studio endpoint is ready for implementation.' });
  }
}
