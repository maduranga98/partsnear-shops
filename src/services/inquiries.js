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
  limit,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../config/firebase';

const INQUIRIES_COLLECTION = 'inquiries';

/**
 * Get recent inquiries for a shop
 */
export const getRecentInquiries = async (shopId, count = 5) => {
  const q = query(
    collection(db, INQUIRIES_COLLECTION),
    where('shopId', '==', shopId),
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Get a single inquiry by ID
 */
export const getInquiry = async (id) => {
  const inquiryRef = doc(db, INQUIRIES_COLLECTION, id);
  const inquiryDoc = await getDoc(inquiryRef);
  if (inquiryDoc.exists()) {
    return { id: inquiryDoc.id, ...inquiryDoc.data() };
  }
  return null;
};

/**
 * Send a reply to an inquiry
 */
export const sendReply = async (inquiryId, replyData) => {
  const inquiryRef = doc(db, INQUIRIES_COLLECTION, inquiryId);
  const reply = {
    ...replyData,
    createdAt: serverTimestamp(),
  };
  
  await updateDoc(inquiryRef, {
    replies: arrayUnion(reply),
    status: 'replied',
    updatedAt: serverTimestamp(),
  });
};

/**
 * Update the status of an inquiry
 */
export const updateInquiryStatus = async (id, status) => {
  const inquiryRef = doc(db, INQUIRIES_COLLECTION, id);
  await updateDoc(inquiryRef, {
    status,
    updatedAt: serverTimestamp(),
  });
};
