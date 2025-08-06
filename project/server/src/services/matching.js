import User from '../models/User.js';
import { getDistance } from 'geolib';

export async function findEligibleReceivers(donation) {
  try {
    // Find receivers within radius who have matching food preferences
    const receivers = await User.find({
      role: 'receiver',
      isActive: true,
      'preferences.foodCategories': { $in: [donation.foodType] },
      'location.coordinates': {
        $geoWithin: {
          $centerSphere: [
            donation.location.coordinates,
            20 / 6371 // 20km radius in radians (max search radius)
          ]
        }
      }
    });

    // Filter and rank receivers
    const eligibleReceivers = receivers
      .map(receiver => {
        const distance = getDistance(
          { latitude: donation.location.coordinates[0], longitude: donation.location.coordinates[1] },
          { latitude: receiver.location.coordinates[0], longitude: receiver.location.coordinates[1] }
        ) / 1000; // Convert to km

        // Check if within receiver's preferred radius
        if (distance > (receiver.preferences?.radiusKm || 10)) {
          return null;
        }

        // Calculate capacity match score (prefer similar capacity)
        const capacityDiff = Math.abs(donation.quantity - (receiver.preferences?.beneficiaryCount || 50));
        const capacityScore = Math.max(0, 100 - capacityDiff);

        // Calculate recency score (prefer receivers who haven't received recently)
        const daysSinceLastDonation = receiver.lastDonationReceived
          ? (Date.now() - receiver.lastDonationReceived.getTime()) / (1000 * 60 * 60 * 24)
          : 30; // If never received, assume 30 days
        const recencyScore = Math.min(100, daysSinceLastDonation * 3);

        // Calculate distance score (prefer closer receivers)
        const distanceScore = Math.max(0, 100 - (distance * 5));

        // Combined score
        const totalScore = (capacityScore * 0.3) + (recencyScore * 0.4) + (distanceScore * 0.3);

        return {
          ...receiver.toObject(),
          distance,
          matchScore: totalScore
        };
      })
      .filter(receiver => receiver !== null)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5); // Notify top 5 matches

    return eligibleReceivers;
  } catch (error) {
    console.error('Error finding eligible receivers:', error);
    return [];
  }
}