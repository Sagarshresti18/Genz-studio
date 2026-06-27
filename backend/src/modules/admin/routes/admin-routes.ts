import { Router } from 'express';
import { AdminController } from '../controllers/admin-controller';

const router = Router();
const controller = new AdminController();

router.get('/', (_req, res) => controller.list(_req, res));

export { router as adminRoutes };
