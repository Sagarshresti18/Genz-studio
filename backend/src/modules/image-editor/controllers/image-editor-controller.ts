import { Request, Response } from 'express';

export class ImageEditorController {
  list(_req: Request, res: Response): void {
    res.status(200).json({ module: 'image-editor', message: 'image-editor endpoint is ready for implementation.' });
  }
}
