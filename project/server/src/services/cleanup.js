import cron from 'node-cron';
import Donation from '../models/Donation.js';

export function startCleanupJob() {
  // Run every 15 minutes to clean up expired donations
  cron.schedule('*/15 * * * *', async () => {
    try {
      const result = await Donation.updateMany(
        {
          status: 'available',
          expiryTime: { $lte: new Date() }
        },
        {
          status: 'expired'
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`🧹 Marked ${result.modifiedCount} donations as expired`);
      }
    } catch (error) {
      console.error('❌ Cleanup job error:', error);
    }
  });

  console.log('🕐 Started automated cleanup job for expired donations');
}