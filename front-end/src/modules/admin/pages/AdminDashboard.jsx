import React from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../../components/BackButton';
import { useUserStatus } from '../../../hooks/useUserStatus';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { userStatus } = useUserStatus();

  const allModules = [
    {
      title: 'User Management',
      description: 'Manage platform users and their accounts',
      icon: '👥',
      color: 'from-blue-500 to-cyan-500',
      stats: [
        { label: 'Total Users', value: '---', icon: '👤' },
        { label: 'Active Users', value: '---', icon: '✅' },
        { label: 'Inactive Users', value: '---', icon: '⛔' },
      ],
      actions: [
        { label: 'View All Users', href: '/admin/users', icon: '👥' },
        { label: 'Manage User Roles', href: '/admin/roles', icon: '🔑' },
      ],
      roles: ['admin'] // Only admin can see this
    },
    {
      title: 'English Learning Module',
      description: 'Manage all aspects of the English learning system',
      icon: '📖',
      color: 'from-purple-500 to-pink-500',
      stats: [
        { label: 'Total Stages', value: '---', icon: '📂' },
        { label: 'Active Sessions', value: '---', icon: '🟢' },
        { label: 'Total Users', value: '---', icon: '👥' },
      ],
      actions: [
        { label: 'Manage Course', href: '/admin/english-learning/course', icon: '📚' },
        { label: 'Course Progress', href: '/admin/english-learning/progress', icon: '📊' },
        { label: 'Video Call Sessions', href: '/admin/english-learning/video-call', icon: '🎥' },
      ]
      // No roles restriction - both admin and partner_english_course can see this
    },
  ];

  // Filter modules based on user role
  const modules = allModules.filter(module => {
    if (module.roles && userStatus) {
      return module.roles.includes(userStatus.role);
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <BackButton to="/home" label="Back to Home" />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-copilot-text-primary mb-2">
            Welcome to Admin Panel
          </h1>
          <p className="text-copilot-text-secondary">
            Manage all aspects of ScaleX platform
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {modules.map((module, idx) => (
            <div
              key={idx}
              className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot overflow-hidden"
            >
              {/* Module Header */}
              <div className={`bg-gradient-to-r ${module.color} p-6 text-white`}>
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-5xl">{module.icon}</div>
                  <div>
                    <h2 className="text-2xl font-bold">{module.title}</h2>
                    <p className="text-white/90 text-sm">{module.description}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="p-6 border-b border-copilot-border-default">
                <div className="grid grid-cols-3 gap-4">
                  {module.stats.map((stat, statIdx) => (
                    <div key={statIdx} className="text-center">
                      <div className="text-2xl mb-1">{stat.icon}</div>
                      <div className="text-2xl font-bold text-copilot-text-primary mb-1">
                        {stat.value}
                      </div>
                      <div className="text-xs text-copilot-text-secondary">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="p-6">
                <div className="space-y-2">
                  {module.actions.map((action, actionIdx) => (
                    <button
                      key={actionIdx}
                      onClick={() => navigate(action.href)}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-copilot-bg-primary hover:bg-copilot-accent-primary hover:text-white border border-copilot-border-default rounded-copilot transition-all text-left"
                    >
                      <span className="text-xl">{action.icon}</span>
                      <span className="font-medium">{action.label}</span>
                      <span className="ml-auto">→</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
          <h3 className="text-xl font-bold text-copilot-text-primary mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userStatus?.role === 'admin' && (
              <>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="flex flex-col items-center gap-2 p-4 bg-copilot-bg-primary hover:bg-blue-50 border border-copilot-border-default rounded-copilot transition-colors"
                >
                  <span className="text-3xl">👥</span>
                  <span className="font-medium text-copilot-text-primary">Manage Users</span>
                </button>
                <button
                  onClick={() => navigate('/admin/roles')}
                  className="flex flex-col items-center gap-2 p-4 bg-copilot-bg-primary hover:bg-green-50 border border-copilot-border-default rounded-copilot transition-colors"
                >
                  <span className="text-3xl">🔑</span>
                  <span className="font-medium text-copilot-text-primary">Manage Roles</span>
                </button>
              </>
            )}
            <button
              onClick={() => navigate('/admin/english-learning/course')}
              className="flex flex-col items-center gap-2 p-4 bg-copilot-bg-primary hover:bg-purple-50 border border-copilot-border-default rounded-copilot transition-colors"
            >
              <span className="text-3xl">📖</span>
              <span className="font-medium text-copilot-text-primary">English Learning</span>
            </button>
          </div>
        </div>

        {/* System Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-copilot p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Admin Panel Information</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• All administrative functions are centralized in this panel</li>
                <li>• User Management: View and manage all platform users</li>
                <li>• Video Call: Control session schedules and monitor active calls</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

