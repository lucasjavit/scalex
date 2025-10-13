import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminGuard from './AdminGuard';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin/english-course', icon: '🏠' },
    { name: 'Lições', href: '/admin/english-course/lessons', icon: '📚' },
    { name: 'Estatísticas', href: '/admin/english-course/statistics', icon: '📊' },
    { name: 'Usuários', href: '/admin/english-course/users', icon: '👥' },
    { name: 'Configurações', href: '/admin/english-course/settings', icon: '⚙️' },
  ];

  const isCurrentPath = (path) => {
    if (path === '/admin/english-course') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-copilot-bg-primary">
        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-64 bg-copilot-bg-secondary border-r border-copilot-border-default">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-xl font-bold text-copilot-text-primary">
                    Admin Panel
                  </h1>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-copilot-text-secondary hover:text-copilot-text-primary"
                  >
                    ✕
                  </button>
                </div>
                <nav className="space-y-2">
                  {navigation.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        navigate(item.href);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-copilot text-left transition-colors ${
                        isCurrentPath(item.href)
                          ? 'bg-copilot-accent-primary text-white'
                          : 'text-copilot-text-secondary hover:bg-copilot-bg-primary hover:text-copilot-text-primary'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      {item.name}
                    </button>
                  ))}
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
                  English Course
                </p>
              </div>
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.href)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-copilot text-left transition-colors ${
                      isCurrentPath(item.href)
                        ? 'bg-copilot-accent-primary text-white'
                        : 'text-copilot-text-secondary hover:bg-copilot-bg-primary hover:text-copilot-text-primary'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.name}
                  </button>
                ))}
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
                    {navigation.find(item => isCurrentPath(item.href))?.name || 'Admin'}
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate('/home')}
                    className="text-copilot-text-secondary hover:text-copilot-text-primary transition-colors"
                  >
                    ← Voltar ao Site
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
