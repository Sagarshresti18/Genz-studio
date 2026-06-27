import { Router } from 'express';
import { VideoStudioController } from '../controllers/video-studio-controller';

const router = Router();
const controller = new VideoStudioController();

router.get('/', (_req, res) => controller.list(_req, res));

export { router as videostudioRoutes };
