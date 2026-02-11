/**
 * Subscription tier definitions for PartsNear
 */

export const TIERS = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
};

export const TIER_HIERARCHY = [TIERS.FREE, TIERS.BASIC, TIERS.PRO, TIERS.ENTERPRISE];

/**
 * Check if a user's tier meets the required tier level
 */
export const hasTierAccess = (userTier, requiredTier) => {
  const userIndex = TIER_HIERARCHY.indexOf(userTier);
  const requiredIndex = TIER_HIERARCHY.indexOf(requiredTier);
  return userIndex >= requiredIndex;
};

export const TIER_DETAILS = {
  [TIERS.FREE]: {
    name: 'Free',
    price: 0,
    features: [
      'Basic shop profile',
      'Up to 50 parts listing',
      'Receive inquiries',
      'Basic dashboard',
    ],
  },
  [TIERS.BASIC]: {
    name: 'Basic',
    price: 29,
    features: [
      'Up to 500 parts listing',
      'Inventory management',
      'Supplier directory',
      'Customer management',
      'Basic analytics',
      'Boost (1 per month)',
    ],
  },
  [TIERS.PRO]: {
    name: 'Pro',
    price: 79,
    features: [
      'Unlimited parts listing',
      'POS system',
      'Staff management',
      'Advanced analytics',
      'Priority support',
      'Boost (5 per month)',
    ],
  },
  [TIERS.ENTERPRISE]: {
    name: 'Enterprise',
    price: 199,
    features: [
      'Everything in Pro',
      'Multi-location support',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'Unlimited boosts',
    ],
  },
};
