import { Router } from 'express';
import { BillingController } from '../controllers/billing-controller';

const router = Router();
const controller = new BillingController();

router.get('/', (_req, res) => controller.list(_req, res));

export { router as billingRoutes };
