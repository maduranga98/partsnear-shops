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
  limit,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

const NOTIFICATIONS_COLLECTION = 'notifications';

/**
 * Add a new notification
 */
export const addNotification = async (notificationData) => {
  const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
    ...notificationData,
    unread: true,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Subscribe to notifications for a specific user/shop
 */
export const subscribeToNotifications = (targetId, callback) => {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('targetId', '==', targetId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(notifications);
  });
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (id) => {
  const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, id);
  await updateDoc(notificationRef, {
    unread: false,
  });
};

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (targetId, notificationIds) => {
  const batch = writeBatch(db);
  notificationIds.forEach(id => {
    const ref = doc(db, NOTIFICATIONS_COLLECTION, id);
    batch.update(ref, { unread: false });
  });
  await batch.commit();
};

/**
 * Clear all notifications or individual one
 */
export const deleteNotification = async (id) => {
  // We usually don't delete but mark as 'archived' if needed
  // For now, let's keep it simple
  const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, id);
  await updateDoc(notificationRef, { archived: true });
};
