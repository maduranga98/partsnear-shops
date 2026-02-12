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
  deleteDoc,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

const STAFF_COLLECTION = 'staff';
const INVITATIONS_COLLECTION = 'staffInvitations';
const ACTIVITY_LOG_COLLECTION = 'activityLogs';

/**
 * Invite a new staff member
 */
export const inviteStaff = async (shopId, email, role) => {
  const inviteRef = collection(db, INVITATIONS_COLLECTION);
  const newInvite = {
    shopId,
    email,
    role,
    status: 'pending',
    invitedAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days expiry
  };

  const docRef = await addDoc(inviteRef, newInvite);
  return { id: docRef.id, ...newInvite };
};

/**
 * Get all staff members for a shop
 */
export const getShopStaff = async (shopId) => {
  const staffRef = collection(db, STAFF_COLLECTION);
  const q = query(staffRef, where('shopId', '==', shopId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Get pending invitations for a shop
 */
export const getPendingInvitations = async (shopId) => {
  const inviteRef = collection(db, INVITATIONS_COLLECTION);
  const q = query(
    inviteRef, 
    where('shopId', '==', shopId), 
    where('status', '==', 'pending')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Update a staff member's role
 */
export const updateStaffRole = async (staffId, role) => {
  const staffRef = doc(db, STAFF_COLLECTION, staffId);
  await updateDoc(staffRef, {
    role,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Deactivate a staff member
 */
export const deactivateStaff = async (staffId) => {
  const staffRef = doc(db, STAFF_COLLECTION, staffId);
  await updateDoc(staffRef, {
    status: 'inactive',
    updatedAt: serverTimestamp(),
  });
};

/**
 * Log a staff activity
 */
export const logStaffActivity = async (shopId, staffId, action, details) => {
  const logRef = collection(db, ACTIVITY_LOG_COLLECTION);
  await addDoc(logRef, {
    shopId,
    staffId,
    action,
    details,
    timestamp: serverTimestamp(),
  });
};

/**
 * Get activity logs for a shop or specific staff
 */
export const getActivityLogs = async (shopId, staffId = null) => {
  const logRef = collection(db, ACTIVITY_LOG_COLLECTION);
  let q;
  if (staffId) {
    q = query(
      logRef, 
      where('shopId', '==', shopId), 
      where('staffId', '==', staffId),
      orderBy('timestamp', 'desc')
    );
  } else {
    q = query(
      logRef, 
      where('shopId', '==', shopId),
      orderBy('timestamp', 'desc')
    );
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
