/**
 * Application-wide constants
 */

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Image upload limits
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGES_PER_PART = 5;

// Status options
export const PART_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft',
};

export const STOCK_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

export const INQUIRY_STATUS = {
  NEW: 'new',
  RESPONDED: 'responded',
  CLOSED: 'closed',
};

// Vehicle makes (sample — extend as needed)
export const VEHICLE_MAKES = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz',
  'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Nissan', 'Subaru',
  'Mazda', 'Lexus', 'Jeep', 'Ram', 'GMC', 'Dodge',
];

// Part categories (sample — extend as needed)
export const PART_CATEGORIES = [
  'Engine', 'Transmission', 'Brakes', 'Suspension', 'Steering',
  'Electrical', 'Body', 'Interior', 'Exhaust', 'Cooling',
  'Fuel System', 'Ignition', 'Lighting', 'Wheels & Tires',
  'AC & Heating', 'Filters', 'Belts & Hoses', 'Accessories',
];

// Notification types
export const NOTIFICATION_TYPES = {
  INQUIRY: 'inquiry',
  ORDER: 'order',
  LOW_STOCK: 'low_stock',
  SYSTEM: 'system',
  SUBSCRIPTION: 'subscription',
};
