import { Router } from 'express';

import { checkDatabaseConnection, isDatabaseConfigured } from '../config/database';

export const healthRouter = Router();

healthRouter.get('/', (_request, response) => {
  response.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get('/db', async (_request, response, next) => {
  try {
    const databaseStatus = await checkDatabaseConnection();

    response.status(databaseStatus.connected ? 200 : 503).json({
      success: databaseStatus.connected,
      databaseConfigured: databaseStatus.configured,
      databaseConnected: databaseStatus.connected,
      message: databaseStatus.message,
    });
  } catch (error) {
    next(error);
  }
});

healthRouter.get('/status', (_request, response) => {
  response.json({
    success: true,
    databaseConfigured: isDatabaseConfigured(),
  });
});