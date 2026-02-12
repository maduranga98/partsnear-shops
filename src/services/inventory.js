import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  increment,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const MOVEMENTS_COLLECTION = 'stockMovements';
const PARTS_COLLECTION = 'parts';
const AUDITS_COLLECTION = 'stockAudits';

/**
 * Adjust stock for a part and log the movement
 */
export const adjustStock = async (partId, adjustmentData) => {
  const { quantity, type, reason, note, staffId, shopId, previousQuantity } = adjustmentData;
  const newQuantity = type === 'set' ? quantity : previousQuantity + quantity;
  const diff = type === 'set' ? (quantity - previousQuantity) : quantity;

  // Update part quantity
  const partRef = doc(db, PARTS_COLLECTION, partId);
  await updateDoc(partRef, {
    quantity: newQuantity,
    updatedAt: serverTimestamp(),
  });

  // Log movement
  await addDoc(collection(db, MOVEMENTS_COLLECTION), {
    partId,
    shopId,
    type: diff > 0 ? 'in' : 'out',
    adjustmentType: type, // 'add', 'subtract', 'set'
    quantity: Math.abs(diff),
    previousQuantity,
    newQuantity,
    reason,
    note,
    staffId,
    createdAt: serverTimestamp(),
  });

  return newQuantity;
};

/**
 * Get stock movements for a shop with filters
 */
export const getStockMovements = async (shopId, filters = {}) => {
  let q = query(
    collection(db, MOVEMENTS_COLLECTION),
    where('shopId', '==', shopId),
    orderBy('createdAt', 'desc')
  );

  if (filters.limit) {
    q = query(q, limit(filters.limit));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Get stock alerts (low stock and out of stock)
 */
export const getStockAlerts = async (shopId) => {
  const partsRef = collection(db, PARTS_COLLECTION);
  
  // This is a bit complex for a single firestore query since thresholds can be per-part
  // For now, we fetch all parts and filter client-side, or use a default threshold if none set
  const q = query(partsRef, where('shopId', '==', shopId));
  const snapshot = await getDocs(q);
  
  const allParts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  return {
    lowStock: allParts.filter(p => p.quantity > 0 && p.quantity <= (p.lowStockThreshold || 5)),
    outOfStock: allParts.filter(p => p.quantity <= 0)
  };
};

/**
 * Update stock alert configuration for a part
 */
export const updateStockThreshold = async (partId, data) => {
  const partRef = doc(db, PARTS_COLLECTION, partId);
  const updateData = typeof data === 'object' ? data : { lowStockThreshold: data };
  await updateDoc(partRef, {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Get dead stock (no movements in X days)
 */
export const getDeadStock = async (shopId, days = 30) => {
  const cutoff = new Timestamp(Date.now() / 1000 - (days * 24 * 60 * 60), 0);
  
  // Fetch all parts
  const partsQ = query(collection(db, PARTS_COLLECTION), where('shopId', '==', shopId));
  const partsSnapshot = await getDocs(partsQ);
  const parts = partsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // This would ideally be a more efficient query, but for now we filter
  // parts that haven't had an 'out' movement since the cutoff
  // Improvement: Track 'lastSoldAt' on the part document itself
  return parts.filter(p => !p.lastSoldAt || p.lastSoldAt < cutoff);
};
/**
 * Update global inventory alert settings for a shop
 */
export const updateGlobalAlertSettings = async (shopId, settings) => {
  const shopRef = doc(db, 'users', shopId);
  await updateDoc(shopRef, {
    inventoryAlertSettings: settings,
    updatedAt: serverTimestamp(),
  });
};
