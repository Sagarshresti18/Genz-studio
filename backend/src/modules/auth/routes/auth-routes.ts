import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/auth-controller';

const router = Router();
const controller = new AuthController();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', authLimiter, (req, res) => controller.login(req, res));
router.post('/signup', authLimiter, (req, res) => controller.signup(req, res));
router.post('/forgot-password', authLimiter, (req, res) => controller.forgotPassword(req, res));
router.post('/verify-email', authLimiter, (req, res) => controller.verifyEmail(req, res));

export { router as authRoutes };
