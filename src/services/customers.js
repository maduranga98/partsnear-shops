import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  increment,
  deleteDoc,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

const CUSTOMERS_COLLECTION = 'customers';
const VEHICLES_SUBCOLLECTION = 'vehicles';
const CREDIT_PAYMENTS_SUBCOLLECTION = 'creditPayments';

/**
 * Add a new customer to a shop
 */
export const addCustomer = async (shopId, customerData) => {
  const customerRef = collection(db, CUSTOMERS_COLLECTION);
  const newCustomer = {
    ...customerData,
    shopId,
    totalSpent: 0,
    creditBalance: 0,
    loyaltyPoints: 0,
    visitCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(customerRef, newCustomer);
  return { id: docRef.id, ...newCustomer };
};

/**
 * Update customer information
 */
export const updateCustomer = async (customerId, data) => {
  const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
  await updateDoc(customerRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Get all customers for a shop
 */
export const getShopCustomers = async (shopId) => {
  const customerRef = collection(db, CUSTOMERS_COLLECTION);
  const q = query(
    customerRef, 
    where('shopId', '==', shopId),
    orderBy('name', 'asc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Get a single customer's details
 */
export const getCustomerById = async (customerId) => {
  const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
  const customerDoc = await getDoc(customerRef);
  
  if (!customerDoc.exists()) return null;
  
  return { id: customerDoc.id, ...customerDoc.data() };
};

/**
 * Add a vehicle to a customer
 */
export const addVehicle = async (customerId, vehicleData) => {
  const vehicleRef = collection(db, CUSTOMERS_COLLECTION, customerId, VEHICLES_SUBCOLLECTION);
  const newVehicle = {
    ...vehicleData,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(vehicleRef, newVehicle);
  return { id: docRef.id, ...newVehicle };
};

/**
 * Update a vehicle's information
 */
export const updateVehicle = async (customerId, vehicleId, data) => {
  const vehicleRef = doc(db, CUSTOMERS_COLLECTION, customerId, VEHICLES_SUBCOLLECTION, vehicleId);
  await updateDoc(vehicleRef, data);
};

/**
 * Remove a vehicle from a customer
 */
export const removeVehicle = async (customerId, vehicleId) => {
  const vehicleRef = doc(db, CUSTOMERS_COLLECTION, customerId, VEHICLES_SUBCOLLECTION, vehicleId);
  await deleteDoc(vehicleRef);
};

/**
 * Get all vehicles for a customer
 */
export const getCustomerVehicles = async (customerId) => {
  const vehicleRef = collection(db, CUSTOMERS_COLLECTION, customerId, VEHICLES_SUBCOLLECTION);
  const querySnapshot = await getDocs(vehicleRef);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Record a payment against credit
 */
export const recordCreditPayment = async (customerId, paymentData) => {
  const batch = writeBatch(db);
  
  // 1. Create payment record
  const paymentRef = doc(collection(db, CUSTOMERS_COLLECTION, customerId, CREDIT_PAYMENTS_SUBCOLLECTION));
  batch.set(paymentRef, {
    ...paymentData,
    type: 'payment',
    date: serverTimestamp(),
    createdAt: serverTimestamp(),
  });

  // 2. Update customer balance
  const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
  batch.update(customerRef, {
    creditBalance: increment(-Number(paymentData.amount)),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
};

/**
 * Add a credit sale to a customer's balance
 */
export const recordCreditSale = async (customerId, saleData) => {
  const batch = writeBatch(db);
  
  // 1. Create credit record
  const recordRef = doc(collection(db, CUSTOMERS_COLLECTION, customerId, CREDIT_PAYMENTS_SUBCOLLECTION));
  batch.set(recordRef, {
    ...saleData,
    type: 'credit_sale',
    date: serverTimestamp(),
    createdAt: serverTimestamp(),
  });

  // 2. Update customer balance
  const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
  batch.update(customerRef, {
    creditBalance: increment(Number(saleData.amount)),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
};

/**
 * Get payment and credit history for a customer
 */
export const getCreditHistory = async (customerId) => {
  const historyRef = collection(db, CUSTOMERS_COLLECTION, customerId, CREDIT_PAYMENTS_SUBCOLLECTION);
  const q = query(historyRef, orderBy('date', 'desc'));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Get customers with outstanding balances
 */
export const getOutstandingBalances = async (shopId) => {
  const customerRef = collection(db, CUSTOMERS_COLLECTION);
  const q = query(
    customerRef, 
    where('shopId', '==', shopId),
    where('creditBalance', '>', 0),
    orderBy('creditBalance', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
