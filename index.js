const { startBot } = require('./lib/bot');

startBot().catch((error) => {
  console.error('[Aditya Xmd Text] Startup failed:', error);
  process.exitCode = 1;
});
