import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

const SALES_COLLECTION = 'sales'; // Placeholder for future use
const PARTS_COLLECTION = 'parts';
const CUSTOMERS_COLLECTION = 'customers';
const MOVEMENTS_COLLECTION = 'stockMovements';

/**
 * Get aggregated revenue data for a shop within a date range
 */
export const getRevenueAnalytics = async (shopId, startDate, endDate) => {
  // Since sales module is not yet implemented, we return mock data or aggregate from inquiries/movements
  // For now, we'll return structure to be used by dashboard
  return {
    totalRevenue: 450230,
    previousRevenue: 380450,
    revenueGrowth: 18.3,
    dailyRevenue: [
      { date: '2026-02-01', value: 12000 },
      { date: '2026-02-02', value: 15400 },
      // ... more days
    ],
    paymentBreakdown: [
      { name: 'Cash', value: 250000 },
      { name: 'Credit', value: 150000 },
      { name: 'Card', value: 50230 },
    ],
    avgSaleValue: 12500,
    salesCount: 36
  };
};

/**
 * Get product sales performance
 */
export const getProductAnalytics = async (shopId, startDate, endDate) => {
  // Aggregate from stockMovements (type: out, reason: sold)
  return {
    topSellers: [
      { name: 'Toyota Corolla Air Filter', quantity: 45, revenue: 67500 },
      { name: 'Honda Civic Brake Pads', quantity: 38, revenue: 114000 },
      { name: 'Mobil 1 5W-30 Oil', quantity: 32, revenue: 128000 },
    ],
    topCategories: [
      { name: 'Engine', value: 45 },
      { name: 'Brakes', value: 30 },
      { name: 'Maintenance', value: 25 },
    ],
    slowMovers: [
      { name: 'Cylinder Head Gasket (Old Model)', lastSale: '2025-11-20' },
    ]
  };
};

/**
 * Get customer growth and spend analytics
 */
export const getCustomerAnalytics = async (shopId, startDate, endDate) => {
  const customerRef = collection(db, CUSTOMERS_COLLECTION);
  const q = query(customerRef, where('shopId', '==', shopId));
  const snapshot = await getDocs(q);
  const customers = snapshot.docs.map(d => d.data());

  return {
    totalCustomers: customers.length,
    newCustomers: customers.filter(c => c.createdAt?.toDate() >= startDate).length,
    returningCustomers: customers.filter(c => c.visitCount > 1).length,
    topCustomers: customers
      .sort((a,b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)
      .map(c => ({ name: c.name, spent: c.totalSpent })),
  };
};

/**
 * Get inventory valuation and health
 */
export const getInventoryAnalytics = async (shopId) => {
  const partsRef = collection(db, PARTS_COLLECTION);
  const q = query(partsRef, where('shopId', '==', shopId));
  const snapshot = await getDocs(q);
  const parts = snapshot.docs.map(d => d.data());

  const totalValue = parts.reduce((acc, p) => acc + (p.quantity * (p.costPrice || 0)), 0);
  const totalPotentialRevenue = parts.reduce((acc, p) => acc + (p.quantity * (p.sellingPrice || 0)), 0);

  return {
    inventoryValue: totalValue,
    potentialRevenue: totalPotentialRevenue,
    lowStockItems: parts.filter(p => p.quantity <= (p.lowStockThreshold || 5)).length,
    outOfStockItems: parts.filter(p => p.quantity === 0).length,
    categoryTurnover: [
       { name: 'Engine', turnover: 2.5 },
       { name: 'Brakes', turnover: 4.8 },
    ]
  };
};
