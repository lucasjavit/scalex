import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../services/adminApi';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAdminStatistics();
      setStatistics(data);
    } catch (err) {
      setError('Error loading statistics');
      console.error('Error loading statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Manage Lessons',
      description: 'Create, edit and delete lessons',
      icon: '📚',
      color: 'bg-blue-500',
      onClick: () => navigate('/admin/english-course/lessons'),
    },
    {
      title: 'Create New Lesson',
      description: 'Add a new lesson to the course',
      icon: '➕',
      color: 'bg-green-500',
      onClick: () => navigate('/admin/english-course/lessons/new'),
    },
    {
      title: 'Manage Users',
      description: 'View and manage registered users',
      icon: '👥',
      color: 'bg-orange-500',
      onClick: () => navigate('/admin/english-course/users'),
    },
    {
      title: 'Statistics',
      description: 'View course reports and metrics',
      icon: '📊',
      color: 'bg-purple-500',
      onClick: () => navigate('/admin/english-course/statistics'),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-copilot p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadStatistics}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded-copilot hover:bg-red-700 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-copilot-text-primary">
            English Course Dashboard
          </h1>
          <p className="text-copilot-text-secondary mt-2">
            Manage lessons, questions and monitor English course progress
          </p>
        </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-copilot">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-copilot-text-secondary">Total Lessons</p>
                <p className="text-2xl font-bold text-copilot-text-primary">
                  {statistics.totalLessons || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-copilot">
                <span className="text-2xl">❓</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-copilot-text-secondary">Total Questions</p>
                <p className="text-2xl font-bold text-copilot-text-primary">
                  {statistics.totalQuestions || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-copilot">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-copilot-text-secondary">Active Users</p>
                <p className="text-2xl font-bold text-copilot-text-primary">
                  {statistics.activeUsers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-copilot">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-copilot-text-secondary">Average Progress</p>
                <p className="text-2xl font-bold text-copilot-text-primary">
                  {statistics.averageProgress || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-copilot-text-primary mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <div
              key={index}
              onClick={action.onClick}
              className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 hover:border-copilot-accent-primary transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-copilot ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                  <span className="text-2xl text-white">{action.icon}</span>
                </div>
                <h3 className="font-semibold text-lg text-copilot-text-primary ml-4">
                  {action.title}
                </h3>
              </div>
              <p className="text-copilot-text-secondary text-sm">
                {action.description}
              </p>
              <div className="mt-4 flex items-center text-copilot-accent-primary text-sm font-medium">
                <span>Access</span>
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-copilot-text-primary mb-6">
          Recent Activity
        </h2>
        <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-copilot-text-primary mb-2">
              Coming soon
            </h3>
            <p className="text-copilot-text-secondary">
              Activity history and system logs will be displayed here
            </p>
          </div>
        </div>
      </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
