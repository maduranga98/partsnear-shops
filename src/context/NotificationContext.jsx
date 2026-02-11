import { createContext, useContext } from 'react';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const notify = {
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
  };

  return (
    <NotificationContext.Provider value={notify}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
