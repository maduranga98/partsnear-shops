import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/helpers';

/**
 * Main Layout component
 * Wraps dashboard pages with Sidebar, Navbar, and Content Area
 */
const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Init

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, the route guard will handle redirect, 
  // but if we wrap this layout on public pages, we might want to hide sidebar.
  // Assuming this layout is ONLY for dashboard/protected pages.
  
  return (
    <div className="flex h-screen bg-surface">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggle={toggleSidebar} 
        isMobile={isMobile} 
      />

      {/* Main Content Wrapper */}
      <div 
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          !isMobile && (isSidebarOpen ? "ml-64" : "ml-20")
        )}
      >
        <Navbar 
          onMenuClick={toggleSidebar} 
          isSidebarOpen={isSidebarOpen} 
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="min-h-full flex flex-col">
                 <Outlet />
                 <Footer className="mt-auto pt-8" />
            </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-darkest/50 z-30 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
