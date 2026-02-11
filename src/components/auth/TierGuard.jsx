import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { hasTierAccess } from '../../config/tiers';

/**
 * Subscription Tier Guard
 * Redirects users without required tier to upgrade page
 */
const TierGuard = ({ requiredTier }) => {
  const { userTier, loading } = useAuth();

  if (loading) {
     return null; // Or a spinner, but cleaner to return null if parent handles loading
  }

  if (!hasTierAccess(userTier, requiredTier)) {
    return <Navigate to="/subscription" replace />;
  }

  return <Outlet />;
};

export default TierGuard;
