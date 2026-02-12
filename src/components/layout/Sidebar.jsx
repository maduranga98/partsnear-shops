import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Package,
  MessageSquare,
  ShoppingCart,
  Users,
  BarChart2,
  Settings,
  Shield,
  Zap,
  MapPin,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store,
  CreditCard,
  Lock,
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { hasTierAccess, TIERS } from '../../config/tiers';
import Tooltip from '../ui/Tooltip';

const NAV_GROUPS = [
  {
    title: 'Core',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/', exact: true, tier: TIERS.FREE },
      { label: 'Parts', icon: Package, path: '/parts', tier: TIERS.FREE },
      { label: 'Inquiries', icon: MessageSquare, path: '/inquiries', tier: TIERS.FREE },
    ]
  },
  {
    title: 'Business',
    items: [
      { label: 'Inventory', icon: Store, path: '/inventory', tier: TIERS.BASIC },
      { label: 'Customers', icon: Users, path: '/customers', tier: TIERS.BASIC },
      { label: 'Suppliers', icon: MapPin, path: '/suppliers', tier: TIERS.BASIC },
      { label: 'Analytics', icon: BarChart2, path: '/analytics', tier: TIERS.BASIC },
      { label: 'Boost', icon: Zap, path: '/boost', tier: TIERS.BASIC },
    ]
  },
  {
    title: 'Enterprise',
    items: [
      { label: 'POS', icon: ShoppingCart, path: '/pos', tier: TIERS.PRO },
      { label: 'Staff', icon: Shield, path: '/staff', tier: TIERS.PRO },
    ]
  },
  {
    title: 'Support',
    items: [
      { label: 'Subscription', icon: CreditCard, path: '/subscription', tier: TIERS.FREE },
      { label: 'Settings', icon: Settings, path: '/settings', tier: TIERS.FREE },
    ]
  }
];

const Sidebar = ({ isOpen, toggle, isMobile }) => {
  const { logout, userTier } = useAuth();
  
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-navy transition-all duration-300 flex flex-col',
        isOpen ? 'w-64' : 'w-20',
        isMobile && !isOpen && '-translate-x-full w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-navy-light shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-xl shrink-0">
            P
          </div>
          <span
            className={cn(
              'font-heading font-bold text-xl text-white whitespace-nowrap transition-opacity duration-300',
              !isOpen && 'opacity-0 w-0'
            )}
          >
            PartsNear
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            {isOpen && (
              <h4 className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                {group.title}
              </h4>
            )}
            
            {group.items.map((item) => {
              const isLocked = !hasTierAccess(userTier, item.tier);
              
              const content = (
                <NavLink
                  key={item.path}
                  to={isLocked ? '/subscription/upgrade' : item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] transition-colors relative group',
                      isActive && !isLocked
                        ? 'bg-primary text-white'
                        : 'text-gray-400 hover:bg-navy-light hover:text-white',
                      isLocked && 'cursor-not-allowed opacity-80'
                    )
                  }
                >
                  <item.icon size={20} className="shrink-0" />
                  <span
                    className={cn(
                      'font-medium whitespace-nowrap transition-all duration-300 flex-1',
                      !isOpen && 'opacity-0 w-0 overflow-hidden'
                    )}
                  >
                    {item.label}
                  </span>
                  
                  {isLocked && isOpen && (
                    <Lock size={14} className="text-gray-600 group-hover:text-primary transition-colors" />
                  )}

                  {/* Tooltip for collapsed state */}
                  {!isOpen && !isMobile && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-darkest text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                      {item.label} {isLocked ? '(Upgrade required)' : ''}
                    </div>
                  )}
                </NavLink>
              );

              if (isLocked && isOpen) {
                return (
                  <Tooltip key={item.path} content={`Available on ${item.tier.toUpperCase()} plan`}>
                    {content}
                  </Tooltip>
                );
              }

              return content;
            })}
          </div>
        ))}
      </nav>

      {/* Footer / Toggle */}
      <div className="p-4 border-t border-navy-light shrink-0">
        <button
          onClick={logout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 text-gray-400 hover:text-white hover:bg-navy-light rounded-[var(--radius-md)] transition-colors',
            !isOpen && 'justify-center'
          )}
        >
          <LogOut size={20} className="shrink-0" />
          <span
            className={cn(
              'font-medium whitespace-nowrap transition-all duration-300',
              !isOpen && 'opacity-0 w-0 overflow-hidden'
            )}
          >
            Logout
          </span>
        </button>

        {!isMobile && (
            <button
            onClick={toggle}
            className="flex items-center justify-center w-full mt-4 h-8 bg-navy-light hover:bg-navy-light/80 text-gray-400 hover:text-white rounded-[var(--radius-sm)] transition-colors"
            >
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
