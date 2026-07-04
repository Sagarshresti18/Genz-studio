const { createServer } = require('node:http');

const { env } = require('./config/env');
const { closeDatabasePool } = require('./config/database');
const { app } = require('./app');

const server = createServer(app);

server.listen(env.PORT, () => {
  console.log(`Server listening on http://localhost:${env.PORT}`);
});

async function shutdown(signal) {
  console.log(`Received ${signal}, shutting down...`);

  server.close(async () => {
    await closeDatabasePool();
    process.exit(0);
  });
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});