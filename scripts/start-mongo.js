const { MongoMemoryServer } = require('mongodb-memory-server');

async function start() {
  const mongod = await MongoMemoryServer.create({
    instance: { port: 27017, dbName: 'salonbook' },
  });
  console.log('[mongo] MongoDB running at', mongod.getUri());
  setInterval(() => {}, 60_000); // keep the process alive
}

start().catch((err) => {
  console.error('[mongo] Failed to start:', err && err.message ? err.message : err);
  process.exit(1);
});
