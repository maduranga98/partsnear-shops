import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { useShop } from './ShopContext';
import { subscribeToNotifications, markAsRead, markAllAsRead } from '../services/notifications';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { shop } = useShop();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let unsubscribe = () => {};
    
    // Subscribe to notifications for the current shop or user
    const targetId = shop?.id || user?.uid;
    if (targetId) {
      unsubscribe = subscribeToNotifications(targetId, (data) => {
        setNotifications(data);
        setUnreadCount(data.filter(n => n.unread).length);
        
        // Optionally trigger browser notification for new items
        const newUnread = data.filter(n => n.unread && !notifications.find(existing => existing.id === n.id));
        if (newUnread.length > 0 && Notification.permission === 'granted') {
           newUnread.forEach(n => {
             new Notification(n.title, { body: n.message });
           });
        }
      });
    }

    return () => unsubscribe();
  }, [shop?.id, user?.uid]);

  const requestPermission = async () => {
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  const notify = {
    // Toast notifications
    success: (message) =>
      toast.success(message, {
        style: {
          background: '#ECFDF5',
          color: '#065F46',
          border: '1px solid #10B981',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '14px',
        },
        iconTheme: { primary: '#10B981', secondary: '#ECFDF5' },
      }),

    error: (message) =>
      toast.error(message, {
        style: {
          background: '#FEF2F2',
          color: '#991B1B',
          border: '1px solid #EF4444',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '14px',
        },
        iconTheme: { primary: '#EF4444', secondary: '#FEF2F2' },
      }),

    warning: (message) =>
      toast(message, {
        icon: '⚠️',
        style: {
          background: '#FFFBEB',
          color: '#92400E',
          border: '1px solid #F59E0B',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '14px',
        },
      }),

    info: (message) =>
      toast(message, {
        icon: 'ℹ️',
        style: {
          background: '#EFF6FF',
          color: '#1E40AF',
          border: '1px solid #3B82F6',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '14px',
        },
      }),

    promise: (promise, { loading, success, error }) =>
      toast.promise(promise, { loading, success, error }),

    dismiss: () => toast.dismiss(),

    // Center state & actions
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead: () => markAllAsRead(shop?.id || user?.uid, notifications.filter(n => n.unread).map(n => n.id)),
    requestPermission,
  };

  return (
    <NotificationContext.Provider value={notify}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
