/**
 * Subscription tier definitions for PartsNear
 */

export const TIERS = {
  BASIC: 'basic',
  STANDARD: 'standard',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
};

export const TIER_HIERARCHY = [TIERS.BASIC, TIERS.STANDARD, TIERS.PREMIUM, TIERS.ENTERPRISE];

/**
 * Check if a user's tier meets the required tier level
 */
export const hasTierAccess = (userTier, requiredTier) => {
  const userIndex = TIER_HIERARCHY.indexOf(userTier);
  const requiredIndex = TIER_HIERARCHY.indexOf(requiredTier);
  return userIndex >= requiredIndex;
};

export const TIER_DETAILS = {
  [TIERS.BASIC]: {
    name: 'Basic',
    price: 2500,
    partsLimit: 500,
    features: [
      'Up to 500 parts listing',
      'Inventory management',
      'Basic dashboard',
      'Public store profile',
      'Email support',
    ],
  },
  [TIERS.STANDARD]: {
    name: 'Standard',
    price: 5000,
    partsLimit: 2000,
    features: [
      'Up to 2,000 parts listing',
      'Everything in Basic',
      'Customer CRM',
      'Advanced analytics',
      'Staff management (up to 3 users)',
      'Priority support',
      'Boost (2 per month)',
    ],
  },
  [TIERS.PREMIUM]: {
    name: 'Premium',
    price: 10000,
    partsLimit: -1, // Unlimited
    features: [
      'Unlimited parts listing',
      'Everything in Standard',
      'POS system',
      'Multi-staff management',
      'Advanced reports',
      'Personal account manager',
      'Boost (10 per month)',
      'Custom invoice/receipt branding',
    ],
  },
  [TIERS.ENTERPRISE]: {
    name: 'Enterprise',
    price: -1, // Custom
    features: [
      'Everything in Premium',
      'Multi-location support',
      'API access',
      'Dedicated server/SLA',
      'Custom integrations',
      'Unlimited boosts',
    ],
  },
};
