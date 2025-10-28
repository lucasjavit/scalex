import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserStatus } from '../../../hooks/useUserStatus';
import AdminGuard from './AdminGuard';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userStatus } = useUserStatus();

  // Full navigation for admin
  const fullNavigation = [
    { name: 'Dashboard', href: '/admin', icon: '🏠', exact: true },
    {
      name: 'Users',
      href: '/admin/users',
      icon: '👥',
      roles: ['admin'] // Only admin can see this
    },
    {
      name: 'English Learning',
      icon: '📖',
      roles: ['admin', 'partner_english_course'], // Admin and English Course Partner
      submenu: [
        {
          name: 'English Course',
          href: '/admin/english-learning/course',
          icon: '📚'
        },
        {
          name: 'Course Progress',
          href: '/admin/english-learning/progress',
          icon: '📊'
        },
        {
          name: 'Video Call',
          href: '/admin/english-learning/video-call',
          icon: '🎥'
        },
      ]
    },
  ];

  // Filter navigation based on user role
  const navigation = fullNavigation.filter(item => {
    // If item has roles restriction, check if user has required role
    if (item.roles && userStatus) {
      return item.roles.includes(userStatus.role);
    }
    // If no role restriction, show to everyone
    return true;
  });

  // Debug: log user role and navigation
  console.log('👤 AdminLayout - User Role:', userStatus?.role);
  console.log('📋 AdminLayout - Navigation items:', navigation.length);

  const isCurrentPath = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const renderNavItem = (item) => {
    if (item.submenu) {
      return (
        <div key={item.name}>
          <div className="flex items-center gap-3 px-3 py-2 text-copilot-text-secondary font-semibold text-sm uppercase">
            <span className="text-lg">{item.icon}</span>
            {item.name}
          </div>
          <div className="ml-4 mt-1 space-y-1">
            {item.submenu.map((subItem) => (
              <button
                key={subItem.name}
                onClick={() => {
                  navigate(subItem.href);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-copilot text-left transition-colors ${
                  isCurrentPath(subItem.href)
                    ? 'bg-copilot-accent-primary text-white'
                    : 'text-copilot-text-secondary hover:bg-copilot-bg-primary hover:text-copilot-text-primary'
                }`}
              >
                <span className="text-base">{subItem.icon}</span>
                <span className="text-sm">{subItem.name}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <button
        key={item.name}
        onClick={() => {
          navigate(item.href);
          setSidebarOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-copilot text-left transition-colors ${
          isCurrentPath(item.href, item.exact)
            ? 'bg-copilot-accent-primary text-white'
            : 'text-copilot-text-secondary hover:bg-copilot-bg-primary hover:text-copilot-text-primary'
        }`}
      >
        <span className="text-lg">{item.icon}</span>
        {item.name}
      </button>
    );
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-copilot-bg-primary">
        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-64 bg-copilot-bg-secondary border-r border-copilot-border-default overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-xl font-bold text-copilot-text-primary">
                      Admin Panel
                    </h1>
                    <p className="text-xs text-copilot-text-secondary mt-1">
                      ScaleX Management
                    </p>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-copilot-text-secondary hover:text-copilot-text-primary"
                  >
                    ✕
                  </button>
                </div>
                <nav className="space-y-2">
                  {navigation.map(renderNavItem)}
                </nav>
              </div>
            </div>
          </div>
        )}

        <div className="flex">
          {/* Desktop sidebar */}
          <div className="hidden lg:block w-64 bg-copilot-bg-secondary border-r border-copilot-border-default min-h-screen">
            <div className="p-6">
              <div className="mb-8">
                <h1 className="text-xl font-bold text-copilot-text-primary">
                  Admin Panel
                </h1>
                <p className="text-sm text-copilot-text-secondary mt-1">
                  ScaleX Management
                </p>
              </div>
              <nav className="space-y-2">
                {navigation.map(renderNavItem)}
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Top bar */}
            <div className="bg-copilot-bg-secondary border-b border-copilot-border-default px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden text-copilot-text-secondary hover:text-copilot-text-primary"
                  >
                    ☰
                  </button>
                  <h2 className="text-lg font-semibold text-copilot-text-primary">
                    Admin Panel
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate('/home')}
                    className="text-copilot-text-secondary hover:text-copilot-text-primary transition-colors"
                  >
                    ← Back to Site
                  </button>
                </div>
              </div>
            </div>

            {/* Page content */}
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminLayout;

