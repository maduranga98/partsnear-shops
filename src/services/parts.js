import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

const PARTS_COLLECTION = 'parts';

/**
 * Generate a unique barcode: SHOP-TS-RAND
 */
const generateBarcode = (shopId) => {
  const prefix = shopId.substring(0, 4).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

/**
 * Add a new part
 */
export const addPart = async (partData) => {
  const barcode = generateBarcode(partData.shopId);
  const docRef = await addDoc(collection(db, PARTS_COLLECTION), {
    ...partData,
    barcode,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Update an existing part
 */
export const updatePart = async (id, partData) => {
  const partRef = doc(db, PARTS_COLLECTION, id);
  await updateDoc(partRef, {
    ...partData,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete a part
 */
export const deletePart = async (id) => {
  const partRef = doc(db, PARTS_COLLECTION, id);
  await deleteDoc(partRef);
};

/**
 * Get parts with filters
 */
export const getShopParts = async (shopId, filters = {}) => {
  let q = query(
    collection(db, PARTS_COLLECTION), 
    where('shopId', '==', shopId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Duplicate a part
 */
export const duplicatePart = async (id) => {
  const partRef = doc(db, PARTS_COLLECTION, id);
  const partDoc = await getDoc(partRef);
  
  if (partDoc.exists()) {
    const data = partDoc.data();
    delete data.createdAt;
    delete data.updatedAt;
    
    return await addPart({
      ...data,
      name: `Copy of ${data.name}`,
    });
  }
  throw new Error('Part not found');
};

/**
 * Get a single part by ID
 */
export const getPart = async (id) => {
  const partRef = doc(db, PARTS_COLLECTION, id);
  const partDoc = await getDoc(partRef);
  if (partDoc.exists()) {
    return { id: partDoc.id, ...partDoc.data() };
  }
  return null;
};

/**
 * Bulk add parts using batches
 */
export const bulkAddParts = async (shopId, parts) => {
  const results = { success: 0, failed: 0, errors: [] };
  
  // Use chunks to avoid firestore batch limit (500)
  const chunkSize = 400;
  for (let i = 0; i < parts.length; i += chunkSize) {
    const chunk = parts.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    
    chunk.forEach((part) => {
      try {
        const partRef = doc(collection(db, PARTS_COLLECTION));
        const barcode = generateBarcode(shopId);
        batch.set(partRef, {
          ...part,
          shopId,
          barcode,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        results.success++;
      } catch (e) {
        results.failed++;
        results.errors.push(e.message);
      }
    });
    
    await batch.commit();
  }
  
  return results;
};
