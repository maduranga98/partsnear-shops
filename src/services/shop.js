import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Get shop profile from Firestore
 * Note: Shop data is currently stored in the 'users' collection alongside auth data
 */
export const getShopProfile = async (uid) => {
  const shopRef = doc(db, 'users', uid);
  const shopDoc = await getDoc(shopRef);
  
  if (!shopDoc.exists()) return null;
  
  return { id: shopDoc.id, ...shopDoc.data() };
};

/**
 * Update shop profile in Firestore
 */
export const updateShopProfile = async (uid, data) => {
  const shopRef = doc(db, 'users', uid);
  await updateDoc(shopRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Calculate profile completion percentage based on required fields
 */
export const calculateProfileCompletion = (shopData) => {
  if (!shopData) return 0;

  const weights = {
    basic: 20,    // Name, Tagline, Description
    media: 20,    // Logo, Cover, Gallery
    location: 20, // Map, Address
    contact: 20,  // Phone, Email, Socials
    special: 20   // Brands, Types, Categories
  };

  let score = 0;

  // Basic Info check
  if (shopData.shopName && shopData.tagline && shopData.description) score += weights.basic;
  else if (shopData.shopName) score += weights.basic / 2;

  // Media check
  if (shopData.logo && shopData.coverPhoto) score += weights.media;
  else if (shopData.logo || shopData.coverPhoto) score += weights.media / 2;

  // Location check
  if (shopData.address && shopData.lat && shopData.lng) score += weights.location;
  else if (shopData.address) score += weights.location / 2;

  // Contact check
  if (shopData.phone && shopData.email) score += weights.contact;
  else if (shopData.phone || shopData.email) score += weights.contact / 2;

  // Specializations check
  if (shopData.brands?.length > 0 && shopData.categories?.length > 0) score += weights.special;
  else if (shopData.brands?.length > 0 || shopData.categories?.length > 0) score += weights.special / 2;

  return Math.min(Math.round(score), 100);
};
