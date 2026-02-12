import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import {
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  logout as logoutService,
  resetPassword,
  resendEmailVerification,
  getUserProfile,
  setupRecaptcha,
  sendPhoneOTP,
  verifyPhoneOTP,
  updateUserProfile,
} from '../services/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          // Fetch user profile from Firestore
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto-logout on token expiry
  useEffect(() => {
    if (!user) return;

    const checkTokenExpiry = async () => {
      try {
        const tokenResult = await user.getIdTokenResult();
        const expirationTime = new Date(tokenResult.expirationTime).getTime();
        const now = Date.now();
        const timeUntilExpiry = expirationTime - now;

        if (timeUntilExpiry <= 0) {
          await logoutService();
        } else {
          // Set timeout to logout when token expires
          const timer = setTimeout(async () => {
            await logoutService();
          }, timeUntilExpiry);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error('Token check error:', err);
      }
    };

    checkTokenExpiry();
  }, [user]);

  const login = async (email, password) => {
    setError(null);
    try {
      const user = await loginWithEmail(email, password);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (data) => {
    setError(null);
    try {
      const user = await registerWithEmail(data);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const googleSignIn = async () => {
    setError(null);
    try {
      const user = await loginWithGoogle();
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const phoneLogin = async (phoneNumber, recaptchaContainerId) => {
    setError(null);
    try {
      const verifier = setupRecaptcha(recaptchaContainerId);
      const confirmationResult = await sendPhoneOTP(phoneNumber, verifier);
      return confirmationResult;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const verifyOTP = async (confirmationResult, otp) => {
    setError(null);
    try {
      const user = await verifyPhoneOTP(confirmationResult, otp);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const forgotPassword = async (email) => {
    setError(null);
    try {
      await resetPassword(email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resendVerification = async () => {
    setError(null);
    try {
      await resendEmailVerification();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await logoutService();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    }
  };

  const updateProfile = async (data) => {
    if (!user) return;
    setError(null);
    try {
      await updateUserProfile(user.uid, data);
      await refreshProfile();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    login,
    register,
    googleSignIn,
    phoneLogin,
    verifyOTP,
    forgotPassword,
    resendVerification,
    logout,
    refreshProfile,
    updateProfile,
    isAuthenticated: !!user,
    isEmailVerified: user?.emailVerified ?? false,
    userTier: userProfile?.tier || 'basic',
    subscriptionStatus: userProfile?.subscriptionStatus || 'active',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
