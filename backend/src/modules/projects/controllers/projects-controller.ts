import { Request, Response } from 'express';

export class ProjectsController {
  list(_req: Request, res: Response): void {
    res.status(200).json({ module: 'projects', message: 'projects endpoint is ready for implementation.' });
  }
}
