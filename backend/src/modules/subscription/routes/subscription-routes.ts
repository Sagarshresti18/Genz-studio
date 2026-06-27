import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription-controller';

const router = Router();
const controller = new SubscriptionController();

router.get('/', (_req, res) => controller.list(_req, res));

export { router as subscriptionRoutes };
