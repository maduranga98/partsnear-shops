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
import Onboarding from './pages/auth/Onboarding';
import EditProfile from './pages/profile/EditProfile';
import PartsList from './pages/parts/PartsList';
import AddPart from './pages/parts/AddPart';
import Dashboard from './pages/dashboard/Dashboard';
import InquiryList from './pages/inquiries/InquiryList';
import InquiryDetail from './pages/inquiries/InquiryDetail';
import BulkImport from './pages/parts/BulkImport';
import Notifications from './pages/notifications/Notifications';
import { ROUTES } from './config/routes';
import { TIERS } from './config/tiers';

import InventoryDashboard from './pages/inventory/InventoryDashboard';
import AdjustStock from './pages/inventory/AdjustStock';
import MovementHistory from './pages/inventory/MovementHistory';
import AlertsConfig from './pages/inventory/AlertsConfig';
import StockTake from './pages/inventory/StockTake';
import DeadStock from './pages/inventory/DeadStock';
import SupplierList from './pages/suppliers/SupplierList';
import AddSupplier from './pages/suppliers/AddSupplier';
import SupplierDetail from './pages/suppliers/SupplierDetail';
import POList from './pages/suppliers/POList';
import CreatePO from './pages/suppliers/CreatePO';
import PODetail from './pages/suppliers/PODetail';
import CustomerList from './pages/customers/CustomerList';
import AddCustomer from './pages/customers/AddCustomer';
import CustomerDetail from './pages/customers/CustomerDetail';
import CreditManagement from './pages/customers/CreditManagement';
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard';
import StaffList from './pages/staff/StaffList';
import StaffDetail from './pages/staff/StaffDetail';

import FeatureLock from './components/ui/FeatureLock';
import SettingsLayout from './pages/settings/SettingsLayout';
import Subscription from './pages/settings/Subscription';
import PlanComparison from './pages/billing/Plans';
import Checkout from './pages/billing/Checkout';

import AccountSettings from './pages/settings/Account';
import NotificationSettings from './pages/settings/Notifications';
import LanguageSettings from './pages/settings/Language';
import TemplatesSettings from './pages/settings/Templates';
import AutoReplySettings from './pages/settings/AutoReply';
import DataManagement from './pages/settings/Data';
import SecuritySettings from './pages/settings/Security';

import BoostDashboard from './pages/boost/BoostDashboard';
import BoostPurchase from './pages/boost/BoostPurchase';

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
                <Route path={ROUTES.ONBOARDING} element={<Onboarding />} />
                <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path={ROUTES.PROFILE} element={<EditProfile />} />
                  <Route path={ROUTES.PARTS} element={<PartsList />} />
                  <Route path={ROUTES.PARTS_ADD} element={<AddPart />} />
                  <Route path={ROUTES.PARTS_EDIT} element={<AddPart />} />
                  <Route path="/parts/import" element={<BulkImport />} />
                  <Route path={ROUTES.INQUIRIES} element={<InquiryList />} />
                  <Route path="/inquiries/:id" element={<InquiryDetail />} />
                  <Route path="/notifications" element={<Notifications />} />
                  
                  {/* Basic Tier Routes */}
                  <Route element={<TierGuard requiredTier={TIERS.BASIC} />}>
                    <Route path={ROUTES.INVENTORY} element={<InventoryDashboard />} />
                    <Route path="/inventory/adjust" element={<AdjustStock />} />
                    <Route path="/inventory/history" element={<MovementHistory />} />
                    <Route path="/inventory/alerts" element={<AlertsConfig />} />
                    <Route path="/inventory/stocktake" element={<StockTake />} />
                    <Route path="/inventory/deadstock" element={<DeadStock />} />
                    
                    {/* Supplier Management */}
                    <Route path={ROUTES.SUPPLIERS} element={<SupplierList />} />
                    <Route path="/suppliers/add" element={<AddSupplier />} />
                    <Route path="/suppliers/:id" element={<SupplierDetail />} />
                    <Route path="/suppliers/:id/edit" element={<AddSupplier />} />
                    
                    {/* Purchase Orders */}
                    <Route path="/purchase-orders" element={<POList />} />
                    <Route path="/purchase-orders/create" element={<CreatePO />} />
                    <Route path="/purchase-orders/:id" element={<PODetail />} />
                  </Route>

                  {/* Standard Tier Routes */}
                  <Route element={<TierGuard requiredTier={TIERS.STANDARD} />}>
                    <Route path={ROUTES.CUSTOMERS} element={<CustomerList />} />
                    <Route path="/customers/add" element={<AddCustomer />} />
                    <Route path="/customers/:id" element={<CustomerDetail />} />
                    <Route path="/customers/:id/edit" element={<AddCustomer />} />
                    <Route path="/customers/credit/report" element={<CreditManagement />} />
                    
                    <Route path={ROUTES.ANALYTICS} element={<AnalyticsDashboard />} />
                    <Route path={ROUTES.STAFF} element={<StaffList />} />
                    <Route path="/staff/:id" element={<StaffDetail />} />

                    <Route path={ROUTES.BOOST} element={<BoostDashboard />} />
                    <Route path="/boost/purchase" element={<BoostPurchase />} />
                  </Route>

                  {/* Premium Tier Routes */}
                  <Route element={<TierGuard requiredTier={TIERS.PREMIUM} />}>
                    <Route path={ROUTES.POS} element={
                      <FeatureLock 
                        title="Professional POS System"
                        description="Streamline your sales process with our lightning-fast point of sale designed for auto parts shops."
                        features={[
                           "Barcode scanning & quick search",
                           "Instant receipt generation",
                           "Multi-payment method support",
                           "Daily cash register closing",
                           "Direct customer credit sales"
                        ]}
                        requiredTier="Premium"
                      />
                    } />
                  </Route>

                  {/* Subscription & Billing */}
                  <Route path="/billing/plans" element={<PlanComparison />} />
                  <Route path="/billing/checkout" element={<Checkout />} />

                  {/* Settings Module */}
                  <Route path="/settings" element={<SettingsLayout />}>
                    <Route index element={<Navigate to="/settings/account" replace />} />
                    <Route path="account" element={<AccountSettings />} />
                    <Route path="subscription" element={<Subscription />} />
                    <Route path="notifications" element={<NotificationSettings />} />
                    <Route path="language" element={<LanguageSettings />} />
                    <Route path="templates" element={<TemplatesSettings />} />
                    <Route path="auto-reply" element={<AutoReplySettings />} />
                    <Route path="data" element={<DataManagement />} />
                    <Route path="security" element={<SecuritySettings />} />
                  </Route>
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
