import { Router } from 'express';
import { ImageEditorController } from '../controllers/image-editor-controller';

const router = Router();
const controller = new ImageEditorController();

router.get('/', (_req, res) => controller.list(_req, res));

export { router as imageeditorRoutes };
