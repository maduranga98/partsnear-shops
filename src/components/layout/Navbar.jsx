import { useState } from 'react';
import { Bell, Search, Menu, User, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn, getInitials } from '../../utils/helpers';
import Input from '../ui/Input';
import Dropdown, { DropdownItem, DropdownDivider, DropdownLabel } from '../ui/Dropdown';
import Badge from '../ui/Badge';
import { useNotification } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const Navbar = ({ onMenuClick, isSidebarOpen }) => {
  const { userProfile, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotification();

  return (
    <header className="h-16 bg-white border-b border-border px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Menu Toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-full lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="hidden md:block max-w-md w-full">
          <Input
            type="search"
            placeholder="Search parts, orders, customers..."
            className="w-full"
            iconPosition="left"
            inputClassName="bg-surface border-transparent focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <Dropdown
          align="right"
          className="w-80 p-0"
          trigger={
            <button className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-full transition-colors">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full border-2 border-white ring-1 ring-white" />
              )}
            </button>
          }
        >
          {() => (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-heading font-semibold text-[14px]">Notifications</h3>
                <Link to="/notifications" className="text-[11px] text-primary hover:text-primary-dark font-medium">
                    View all
                </Link>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-12 h-12 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-2 text-text-muted">
                           <Bell size={24} />
                        </div>
                        <p className="text-text-muted text-[13px]">No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <Link 
                          key={n.id} 
                          to={n.link || '/notifications'}
                          onClick={() => n.unread && markAsRead(n.id)}
                          className={cn(
                            "block px-4 py-3 border-b border-border last:border-0 hover:bg-surface transition-colors", 
                            n.unread && "bg-primary/5"
                          )}
                        >
                            <div className="flex justify-between items-start mb-0.5">
                                <span className={cn("font-bold text-[13px]", n.unread ? "text-text-primary" : "text-text-body")}>
                                  {n.title}
                                </span>
                                <span className="text-[9px] text-text-muted font-medium">
                                  {n.createdAt ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                                </span>
                            </div>
                            <p className="text-[12px] text-text-secondary line-clamp-2 leading-relaxed">{n.message}</p>
                        </Link>
                    ))
                )}
              </div>
            </>
          )}
        </Dropdown>

        {/* Profile */}
        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-3 p-1 pl-2 pr-1 rounded-full hover:bg-surface transition-colors border border-transparent hover:border-border">
              <div className="hidden md:flex flex-col items-end mr-1">
                <span className="text-[13px] font-semibold text-text-primary leading-tight">
                  {userProfile?.displayName || 'User'}
                </span>
                <span className="text-[11px] text-text-secondary leading-tight capitalize">
                  {userProfile?.role || userProfile?.tier || 'Owner'}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[13px] shadow-sm">
                {getInitials(userProfile?.displayName) || <User size={16} />}
              </div>
            </button>
          }
        >
          {({ close }) => (
            <>
              <div className="px-4 py-3 border-b border-border md:hidden">
                <p className="font-semibold text-text-primary">{userProfile?.displayName || 'User'}</p>
                <p className="text-xs text-text-secondary capitalize">{userProfile?.tier || 'Free'} Plan</p>
              </div>
              <DropdownLabel>Account</DropdownLabel>
              <DropdownItem icon={User} onClick={() => { close(); /* navigate */ }}>
                <Link to="/profile" className="flex-1">Profile</Link>
              </DropdownItem>
              <DropdownItem icon={Settings} onClick={() => { close(); /* navigate */ }}>
                <Link to="/settings" className="flex-1">Settings</Link>
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem icon={LogOut} danger onClick={() => { close(); logout(); }}>
                Logout
              </DropdownItem>
            </>
          )}
        </Dropdown>
      </div>
    </header>
  );
};

export default Navbar;
