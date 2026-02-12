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
  Timestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

const SUPPLIERS_COLLECTION = 'suppliers';
const PO_COLLECTION = 'purchaseOrders';
const MOVEMENTS_COLLECTION = 'stockMovements';
const PARTS_COLLECTION = 'parts';

/**
 * Supplier Management
 */
export const addSupplier = async (shopId, supplierData) => {
  const docRef = await addDoc(collection(db, SUPPLIERS_COLLECTION), {
    ...supplierData,
    shopId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateSupplier = async (id, supplierData) => {
  const supplierRef = doc(db, SUPPLIERS_COLLECTION, id);
  await updateDoc(supplierRef, {
    ...supplierData,
    updatedAt: serverTimestamp(),
  });
};

export const getShopSuppliers = async (shopId) => {
  const q = query(
    collection(db, SUPPLIERS_COLLECTION),
    where('shopId', '==', shopId),
    orderBy('name', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Purchase Orders
 */
export const createPurchaseOrder = async (shopId, poData) => {
  const poNumber = `PO-${Date.now().toString().slice(-6)}`;
  const docRef = await addDoc(collection(db, PO_COLLECTION), {
    ...poData,
    shopId,
    poNumber,
    status: 'Draft',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updatePOStatus = async (poId, status) => {
  const poRef = doc(db, PO_COLLECTION, poId);
  await updateDoc(poRef, {
    status,
    updatedAt: serverTimestamp(),
  });
};

export const getPurchaseOrders = async (shopId) => {
  const q = query(
    collection(db, PO_COLLECTION),
    where('shopId', '==', shopId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Receive Goods and Update Stock
 */
export const receiveGoods = async (poId, items, shopId, staffId) => {
  const batch = writeBatch(db);
  const poRef = doc(db, PO_COLLECTION, poId);

  // Update PO status to 'Received' (or 'Partially Received' logic could be added)
  batch.update(poRef, {
    status: 'Received',
    receivedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update stock for each item
  for (const item of items) {
    if (!item.partId) continue; // Skip items not in catalog

    const partRef = doc(db, PARTS_COLLECTION, item.partId);
    
    // We need current quantity to log movement correctly
    // In a batch, we can't easily read, so we might need a separate transaction 
    // or just use increment() if movement log isn't strictly required to have previousQuantity here.
    // However, for audit trail, movement logs are better.
    
    // For now, simpler approach: use increment and a separate movement log
    // Better: use increment and then handle movement logs elsewhere or accept missing prevQty
    batch.update(partRef, {
      quantity: increment(item.quantity),
      updatedAt: serverTimestamp(),
    });

    // Log movement
    const movementRef = doc(collection(db, MOVEMENTS_COLLECTION));
    batch.set(movementRef, {
      partId: item.partId,
      shopId,
      type: 'in',
      adjustmentType: 'add',
      quantity: item.quantity,
      reason: 'Received PO',
      staffId,
      poId,
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();
};
