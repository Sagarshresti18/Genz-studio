import { Router } from 'express';
import { UsersController } from '../controllers/users-controller';

const router = Router();
const controller = new UsersController();

router.get('/', (_req, res) => controller.list(_req, res));

export { router as usersRoutes };
