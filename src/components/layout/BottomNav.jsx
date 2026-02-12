import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, MessageSquare, User, Menu } from 'lucide-react';
import { cn } from '../../utils/helpers';

const BottomNav = ({ onMenuClick }) => {
  const navItems = [
    { label: 'Home', icon: LayoutDashboard, path: '/', exact: true },
    { label: 'Parts', icon: Package, path: '/parts' },
    { label: 'Inquiries', icon: MessageSquare, path: '/inquiries' },
    { label: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-border flex items-center justify-around px-2 z-40 lg:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.exact}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all',
              isActive ? 'text-primary' : 'text-text-muted hover:text-text-secondary'
            )
          }
        >
          <item.icon size={20} className={cn('transition-transform duration-300', 'group-active:scale-95')} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
        </NavLink>
      ))}
      
      <button
        onClick={onMenuClick}
        className="flex flex-col items-center gap-1 px-3 py-2 text-text-muted hover:text-text-secondary"
      >
        <Menu size={20} />
        <span className="text-[10px] font-bold uppercase tracking-wider">Menu</span>
      </button>
    </nav>
  );
};

export default BottomNav;
