import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { authRoutes } from './modules/auth/routes/auth-routes';
import { usersRoutes } from './modules/users/routes/users-routes';
import { dashboardRoutes } from './modules/dashboard/routes/dashboard-routes';
import { projectsRoutes } from './modules/projects/routes/projects-routes';
import { aitoolsRoutes } from './modules/ai-tools/routes/ai-tools-routes';
import { imageeditorRoutes } from './modules/image-editor/routes/image-editor-routes';
import { videostudioRoutes } from './modules/video-studio/routes/video-studio-routes';
import { subscriptionRoutes } from './modules/subscription/routes/subscription-routes';
import { billingRoutes } from './modules/billing/routes/billing-routes';
import { adminRoutes } from './modules/admin/routes/admin-routes';
import { requireJwt, requireRole } from './core/middleware/auth-middleware';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', requireJwt, usersRoutes);
app.use('/api/dashboard', requireJwt, dashboardRoutes);
app.use('/api/projects', requireJwt, projectsRoutes);
app.use('/api/ai-tools', requireJwt, aitoolsRoutes);
app.use('/api/image-editor', requireJwt, imageeditorRoutes);
app.use('/api/video-studio', requireJwt, videostudioRoutes);
app.use('/api/subscription', requireJwt, subscriptionRoutes);
app.use('/api/billing', requireJwt, billingRoutes);
app.use('/api/admin', requireJwt, requireRole('Admin'), adminRoutes);
