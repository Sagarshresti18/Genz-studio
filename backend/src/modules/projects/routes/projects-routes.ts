import { Router } from 'express';
import { ProjectsController } from '../controllers/projects-controller';

const router = Router();
const controller = new ProjectsController();

router.get('/', (_req, res) => controller.list(_req, res));

export { router as projectsRoutes };
