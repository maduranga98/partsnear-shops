import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import TierGuard from './components/auth/TierGuard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import { ROUTES } from './config/routes';
import { TIERS } from './config/tiers';

// Placeholder Pages for now
const Dashboard = () => <div className="p-4"><h1 className="text-2xl font-bold">Dashboard</h1><p>Welcome to PartsNear!</p></div>;
const Parts = () => <div className="p-4"><h1 className="text-2xl font-bold">Parts Management</h1></div>;
const Inventory = () => <div className="p-4"><h1 className="text-2xl font-bold">Inventory</h1></div>;
const Subscription = () => <div className="p-4"><h1 className="text-2xl font-bold">Subscription Plans</h1></div>;
const NotFound = () => <div className="p-4 text-center"><h1 className="text-4xl font-bold mb-4">404</h1><p>Page not found</p></div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <ShopProvider>
          <NotificationProvider>
            <Toaster position="top-right" />
            <Routes>
              {/* Public Routes */}
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.REGISTER} element={<Register />} />
              <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
              <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path={ROUTES.PARTS} element={<Parts />} />
                  <Route path={ROUTES.INQUIRIES} element={<div className="p-4">Inquiries</div>} />
                  
                  {/* Basic Tier Routes */}
                  <Route element={<TierGuard requiredTier={TIERS.BASIC} />}>
                    <Route path={ROUTES.INVENTORY} element={<Inventory />} />
                    <Route path={ROUTES.SUPPLIERS} element={<div className="p-4">Suppliers</div>} />
                    <Route path={ROUTES.CUSTOMERS} element={<div className="p-4">Customers</div>} />
                    <Route path={ROUTES.ANALYTICS} element={<div className="p-4">Analytics</div>} />
                    <Route path={ROUTES.BOOST} element={<div className="p-4">Boost</div>} />
                  </Route>

                  {/* Pro Tier Routes */}
                  <Route element={<TierGuard requiredTier={TIERS.PRO} />}>
                     <Route path={ROUTES.POS} element={<div className="p-4">POS System</div>} />
                     <Route path={ROUTES.STAFF} element={<div className="p-4">Staff Management</div>} />
                  </Route>

                  <Route path={ROUTES.SUBSCRIPTION} element={<Subscription />} />
                  <Route path={ROUTES.SETTINGS} element={<div className="p-4">Settings</div>} />
                </Route>
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </NotificationProvider>
        </ShopProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
