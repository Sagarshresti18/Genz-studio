import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard-controller';

const router = Router();
const controller = new DashboardController();

router.get('/', (_req, res) => controller.list(_req, res));

export { router as dashboardRoutes };
