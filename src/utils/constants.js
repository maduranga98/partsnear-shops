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

// Part types
export const PART_TYPES = [
  'OEM (Original Equipment Manufacturer)',
  'Aftermarket',
  'Genuine',
  'Performance',
];

// Part conditions
export const PART_CONDITIONS = [
  'New',
  'Used',
  'Reconditioned',
  'Open Box',
];

// Extended Part categories (sample — extend as needed)
export const PART_CATEGORIES = [
  'Engine', 'Transmission', 'Brakes', 'Suspension', 'Steering',
  'Electrical', 'Body', 'Interior', 'Exhaust', 'Cooling',
  'Fuel System', 'Ignition', 'Lighting', 'Wheels & Tires',
  'AC & Heating', 'Filters', 'Belts & Hoses', 'Bearings', 'Accessories',
];

// Notification types
export const NOTIFICATION_TYPES = {
  INQUIRY: 'inquiry',
  ORDER: 'order',
  LOW_STOCK: 'low_stock',
  SYSTEM: 'system',
  SUBSCRIPTION: 'subscription',
};
// Sub-categories for parts
export const PART_SUB_CATEGORIES = {
  'Engine': ['Cylinder Head', 'Piston', 'Crankshaft', 'Engine Mount', 'Gasket Kit'],
  'Brakes': ['Brake Pads', 'Brake Discs', 'Brake Caliper', 'Brake Master Cylinder', 'ABS Sensor'],
  'Suspension': ['Shock Absorber', 'Control Arm', 'Ball Joint', 'Coil Spring', 'Strut Mount'],
  'Electrical': ['Alternator', 'Starter Motor', 'Battery', 'Ignition Coil', 'Sensors'],
  'Bearings': ['Wheel Bearing', 'Hub Bearing', 'Release Bearing', 'Clutch Bearing'],
  // Add more as needed...
};

// Advanced specification definitions per category
export const PART_SPECIFICATIONS = {
  'Bearings': [
    { name: 'innerDiameter', label: 'Inner Diameter', type: 'number', unit: 'mm', required: true },
    { name: 'outerDiameter', label: 'Outer Diameter', type: 'number', unit: 'mm', required: true },
    { name: 'width', label: 'Width', type: 'number', unit: 'mm', required: true },
    { name: 'bearingCode', label: 'Bearing Code', type: 'text', placeholder: 'e.g. 6204-2RS' },
    { name: 'type', label: 'Type', type: 'select', options: ['Ball', 'Roller', 'Tapered', 'Needle'] },
  ],
  'Brakes': [
    { name: 'material', label: 'Material', type: 'select', options: ['Ceramic', 'Semi-Metallic', 'Organic'] },
    { name: 'thickness', label: 'Thickness', type: 'number', unit: 'mm' },
  ],
  // Add more specifications for other categories...
};
// Stock adjustment reasons
export const ADJUSTMENT_REASONS = [
  { value: 'received', label: 'Received', type: 'in' },
  { value: 'sold', label: 'Sold (manual)', type: 'out' },
  { value: 'damaged', label: 'Damaged', type: 'out' },
  { value: 'returned', label: 'Returned', type: 'in' },
  { value: 'correction', label: 'Correction', type: 'both' },
  { value: 'theft', label: 'Theft', type: 'out' },
  { value: 'expired', label: 'Expired', type: 'out' },
  { value: 'stocktake', label: 'Stock Take', type: 'both' },
];
// Customer tags
export const CUSTOMER_TAGS = [
  'Wholesale', 'Regular', 'VIP', 'Mechanic', 'Garage',
];

// Staff roles
export const STAFF_ROLES = {
  OWNER: 'Owner',
  MANAGER: 'Manager',
  CASHIER: 'Cashier',
  INVENTORY: 'Inventory Staff',
  VIEWER: 'Viewer',
};

// Payment methods
export const PAYMENT_METHODS = [
  'Cash', 'Credit', 'Card', 'Bank Transfer', 'Online',
];
