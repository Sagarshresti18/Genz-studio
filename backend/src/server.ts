import { app } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`Genz Studio backend running on port ${env.port}`);
  });
}

void bootstrap();
