import { Router } from 'express';
import { AiToolsController } from '../controllers/ai-tools-controller';

const router = Router();
const controller = new AiToolsController();

router.get('/', (_req, res) => controller.list(_req, res));

export { router as aitoolsRoutes };
