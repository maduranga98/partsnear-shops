import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getShopProfile } from '../services/shop';

const ShopContext = createContext(null);

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export const ShopProvider = ({ children }) => {
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      if (user?.uid) {
        setLoading(true);
        try {
          const shopData = await getShopProfile(user.uid);
          setShop(shopData);
        } catch (error) {
          console.error('Error fetching shop:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setShop(null);
        setLoading(false);
      }
    };

    fetchShop();
  }, [user]);

  const value = {
    shop,
    setShop,
    loading,
    setLoading,
    refreshShop: async () => {
      if (user?.uid) {
        const shopData = await getShopProfile(user.uid);
        setShop(shopData);
      }
    }
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContext;
