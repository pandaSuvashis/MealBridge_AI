import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { processDonationExpiry } from './services/donation-expiry.service.js';

async function start() {
  try {
    await connectDatabase();
    await processDonationExpiry();
    const expiryJob = setInterval(() => {
      void processDonationExpiry().catch((error) => console.error('Donation expiry cleanup failed.', error));
    }, 10_000);
    expiryJob.unref();
    app.listen(env.port, () => console.log(`MealBridge API listening on port ${env.port}`));
  } catch (error) {
    console.error('MealBridge API could not start because MongoDB connection failed.', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

void start();
