/**
 * Route configuration for PartsNear
 * Each route defines: path, component (lazy-loaded), auth requirement, tier requirement
 */

export const ROUTES = {
  // Auth routes (public)
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_EMAIL: '/verify-email',
  ONBOARDING: '/onboarding',

  // Protected routes
  DASHBOARD: '/',
  PROFILE: '/profile',

  // Parts
  PARTS: '/parts',
  PARTS_ADD: '/parts/add',
  PARTS_EDIT: '/parts/:id/edit',
  PARTS_VIEW: '/parts/:id',

  // Inquiries
  INQUIRIES: '/inquiries',
  INQUIRY_VIEW: '/inquiries/:id',

  // Inventory
  INVENTORY: '/inventory',
  INVENTORY_ADD: '/inventory/add',

  // Suppliers
  SUPPLIERS: '/suppliers',
  SUPPLIER_VIEW: '/suppliers/:id',

  // POS
  POS: '/pos',
  POS_HISTORY: '/pos/history',

  // Analytics
  ANALYTICS: '/analytics',

  // Customers
  CUSTOMERS: '/customers',
  CUSTOMER_VIEW: '/customers/:id',

  // Staff
  STAFF: '/staff',
  STAFF_ADD: '/staff/add',

  // Boost
  BOOST: '/boost',

  // Subscription
  SUBSCRIPTION: '/subscription',
  SUBSCRIPTION_UPGRADE: '/subscription/upgrade',

  // Settings
  SETTINGS: '/settings',
};

/**
 * Routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.VERIFY_EMAIL,
];

/**
 * Feature-to-tier mapping
 * 'free' = available to all, 'basic' = basic+, 'pro' = pro only, 'enterprise' = enterprise only
 */
export const FEATURE_TIERS = {
  [ROUTES.DASHBOARD]: 'free',
  [ROUTES.PROFILE]: 'free',
  [ROUTES.PARTS]: 'free',
  [ROUTES.INQUIRIES]: 'free',
  [ROUTES.INVENTORY]: 'basic',
  [ROUTES.SUPPLIERS]: 'basic',
  [ROUTES.POS]: 'pro',
  [ROUTES.ANALYTICS]: 'basic',
  [ROUTES.CUSTOMERS]: 'basic',
  [ROUTES.STAFF]: 'pro',
  [ROUTES.BOOST]: 'basic',
  [ROUTES.SUBSCRIPTION]: 'free',
  [ROUTES.SETTINGS]: 'free',
};
