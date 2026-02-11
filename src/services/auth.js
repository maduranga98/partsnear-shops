import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const googleProvider = new GoogleAuthProvider();

/**
 * Register a new user with email and password
 */
export const registerWithEmail = async ({ email, password, shopName, phone, displayName }) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update profile display name
  await updateProfile(user, { displayName: displayName || shopName });

  // Create user document in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email,
    displayName: displayName || shopName,
    shopName,
    phone,
    tier: 'free',
    emailVerified: false,
    onboardingComplete: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Send email verification
  await sendEmailVerification(user);

  return user;
};

/**
 * Sign in with email and password
 */
export const loginWithEmail = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Sign in with Google OAuth
 */
export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Check if user doc exists, if not create one
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      phone: user.phoneNumber || '',
      shopName: '',
      tier: 'free',
      emailVerified: true,
      onboardingComplete: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return user;
};

/**
 * Set up reCAPTCHA verifier for phone auth
 */
export const setupRecaptcha = (containerId) => {
  const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
  });
  return recaptchaVerifier;
};

/**
 * Send OTP to phone number
 */
export const sendPhoneOTP = async (phoneNumber, recaptchaVerifier) => {
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  return confirmationResult;
};

/**
 * Verify phone OTP
 */
export const verifyPhoneOTP = async (confirmationResult, otp) => {
  const result = await confirmationResult.confirm(otp);
  return result.user;
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

/**
 * Resend email verification
 */
export const resendEmailVerification = async () => {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
};

/**
 * Sign out
 */
export const logout = async () => {
  await signOut(auth);
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (uid) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
};
