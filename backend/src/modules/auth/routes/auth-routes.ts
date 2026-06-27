import { Router } from 'express';
import { AuthController } from '../controllers/auth-controller';

const router = Router();
const controller = new AuthController();

router.post('/login', (req, res) => controller.login(req, res));
router.post('/signup', (req, res) => controller.signup(req, res));
router.post('/forgot-password', (req, res) => controller.forgotPassword(req, res));
router.post('/verify-email', (req, res) => controller.verifyEmail(req, res));

export { router as authRoutes };
