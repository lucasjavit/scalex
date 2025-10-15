import AdminLayout from '../components/AdminLayout';

const StatisticsPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-copilot-text-primary">
            Statistics
          </h1>
          <p className="text-copilot-text-secondary mt-2">
            View detailed statistics and analytics for the English course
          </p>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-12">
          <div className="text-center">
            <div className="text-6xl mb-6">📊</div>
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-4">
              Statistics Page
            </h2>
            <p className="text-copilot-text-secondary text-lg mb-6">
              Detailed analytics and reports will be available here soon
            </p>
            <div className="inline-block bg-blue-50 border border-blue-200 rounded-copilot p-4">
              <p className="text-sm text-blue-800">
                <strong>Coming features:</strong> Student progress tracking, lesson completion rates,
                performance analytics, and detailed reporting
              </p>
            </div>
          </div>
        </div>

        {/* Placeholder Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
            <div className="text-center">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-lg font-semibold text-copilot-text-primary mb-2">
                User Analytics
              </h3>
              <p className="text-sm text-copilot-text-secondary">
                Track user engagement and activity
              </p>
            </div>
          </div>

          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
            <div className="text-center">
              <div className="text-4xl mb-3">📈</div>
              <h3 className="text-lg font-semibold text-copilot-text-primary mb-2">
                Progress Reports
              </h3>
              <p className="text-sm text-copilot-text-secondary">
                Monitor lesson completion rates
              </p>
            </div>
          </div>

          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-copilot-text-primary mb-2">
                Performance Metrics
              </h3>
              <p className="text-sm text-copilot-text-secondary">
                Analyze student performance data
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StatisticsPage;
