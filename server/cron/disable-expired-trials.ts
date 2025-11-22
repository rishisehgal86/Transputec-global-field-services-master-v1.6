/**
 * Cron job to disable expired trial accounts
 * 
 * This script should be run daily (e.g., via Railway cron or external scheduler)
 * It finds all trial accounts where trialEndsAt < now and sets isActive=false
 */

import { disableExpiredTrials } from '../trial-manager';

async function main() {
  console.log('[Cron] Starting expired trial check...');
  console.log('[Cron] Current time:', new Date().toISOString());

  try {
    const result = await disableExpiredTrials();
    
    console.log('[Cron] Expired trial check completed');
    console.log(`[Cron] Accounts disabled: ${result.disabled}`);
    console.log(`[Cron] Errors encountered: ${result.errors}`);

    if (result.errors > 0) {
      console.error('[Cron] Some accounts failed to disable - manual review required');
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('[Cron] Fatal error during expired trial check:', error);
    process.exit(1);
  }
}

main();

