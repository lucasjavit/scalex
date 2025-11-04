import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../../hooks/useNotification';
import { getApiUrl } from '../../../utils/apiUrl';
import { useAuth } from '../../auth-social/context/AuthContext';
import AdminLayout from '../components/AdminLayout';

const VideoCallAdmin = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showConfirmation } = useNotification();
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [showAddPeriodForm, setShowAddPeriodForm] = useState(false);
  const [newPeriod, setNewPeriod] = useState({
    startHour: '',
    startMinute: '',
    endHour: '',
    endMinute: ''
  });
  const [clearingQueue, setClearingQueue] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Load data on mount
    if (user) {
      loadData();
      // Poll every 5 seconds
      const interval = setInterval(loadData, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Helper function to get auth headers
  const getAuthHeaders = async () => {
    if (!user) return {};
    const token = await user.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const loadData = async () => {
    try {
      if (!user) {
        console.log('⚠️ User not authenticated yet');
        return;
      }

      const headers = await getAuthHeaders();

      const [statusRes, statsRes] = await Promise.all([
        fetch(getApiUrl('/english-learning/admin/video-call/system-status'), { headers }),
        fetch(getApiUrl('/english-learning/admin/video-call/admin/statistics'), { headers })
      ]);

      const statusData = await statusRes.json();
      const statsData = await statsRes.json();

      setSystemStatus(statusData.data);
      setAdminStats(statsData.data);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading admin data:', error);
      setLoading(false);
    }
  };

  const handleDisableSystem = async () => {
    showConfirmation(
      'Are you sure you want to DISABLE the system manually?\n\nThis will:\n- Clear the queue\n- Stop all future sessions\n- System will be offline until reactivated',
      () => {
        disableSystem();
      }
    );
  };

  const disableSystem = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(getApiUrl('/english-learning/admin/video-call/admin/disable'), {
        method: 'POST',
        headers,
      });

      const result = await response.json();
      
      if (result.success) {
        showSuccess(result.message);
        loadData();
      } else {
        showError('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error disabling system:', error);
      showError('Error disabling system');
    }
  };

  const handleEnableSystem = async () => {
    showConfirmation(
      'Are you sure you want to ENABLE the system?\n\nThis will:\n- Return to automatic mode\n- Follow scheduled times',
      () => {
        enableSystem();
      }
    );
  };

  const enableSystem = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(getApiUrl('/english-learning/admin/video-call/admin/enable'), {
        method: 'POST',
        headers,
      });

      const result = await response.json();
      
      if (result.success) {
        showSuccess(result.message);
        loadData();
      } else {
        showError('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error enabling system:', error);
      showError('Error enabling system');
    }
  };

  const handleAddPeriod = async (e) => {
    e.preventDefault();
    
    const period = {
      start: {
        hour: parseInt(newPeriod.startHour, 10),
        minute: parseInt(newPeriod.startMinute, 10)
      },
      end: {
        hour: parseInt(newPeriod.endHour, 10),
        minute: parseInt(newPeriod.endMinute, 10)
      }
    };

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(getApiUrl('/english-learning/admin/video-call/admin/add-period'), {
        method: 'POST',
        headers,
        body: JSON.stringify(period),
      });

      const result = await response.json();
      
      if (result.success) {
        showSuccess(result.message);
        setShowAddPeriodForm(false);
        setNewPeriod({ startHour: '', startMinute: '', endHour: '', endMinute: '' });
        loadData();
      } else {
        showError(result.message);
      }
    } catch (error) {
      console.error('Error adding period:', error);
      showError('Error adding period');
    }
  };

  const handleRemovePeriod = async (index) => {
    showConfirmation(
      'Are you sure you want to remove this period?',
      () => {
        removePeriod(index);
      }
    );
  };

  const removePeriod = async (index) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(getApiUrl(`/english-learning/admin/video-call/admin/remove-period/${index}`), {
        method: 'DELETE',
        headers,
      });

      const result = await response.json();
      
      if (result.success) {
        showSuccess(result.message);
        loadData();
      } else {
        showError(result.message);
      }
    } catch (error) {
      console.error('Error removing period:', error);
      showError('Error removing period');
    }
  };

  const handleClearQueue = async () => {
    showConfirmation(
      'Are you sure you want to clear the waiting queue?\n\nThis will remove ALL users currently waiting for a session.',
      () => {
        clearQueue();
      }
    );
  };

  const clearQueue = async () => {
    try {
      setClearingQueue(true);
      const headers = await getAuthHeaders();
      const response = await fetch(getApiUrl('/english-learning/admin/video-call/admin/queue/clear'), {
        method: 'POST',
        headers,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showSuccess(`Queue cleared successfully!\n\nRemoved ${result.removedCount} users from the queue.`);
        loadData(); // Reload data to update queue count
      } else {
        showError(`Error clearing queue: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error clearing queue:', error);
      showError('Error clearing queue');
    } finally {
      setClearingQueue(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-copilot-accent-primary mx-auto mb-4"></div>
            <p className="text-copilot-text-secondary">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-copilot-text-primary mb-2">
            Video Call Management
          </h1>
          <p className="text-copilot-text-secondary">
            Manual control of video call system
          </p>
        </div>

        {/* System Status */}
        <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 mb-8">
          <h2 className="text-2xl font-bold text-copilot-text-primary mb-6">
            System Status
          </h2>

          {/* Status Badge */}
          <div className="mb-6">
            <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-copilot border-2 ${
              systemStatus?.isActive && systemStatus?.canAcceptSessions
                ? 'bg-green-50 border-green-500'
                : 'bg-yellow-50 border-yellow-500'
            }`}>
              <span className="text-4xl">
                {systemStatus?.isActive && systemStatus?.canAcceptSessions ? '🟢' : '🟡'}
              </span>
              <div>
                <h3 className={`text-xl font-bold ${
                  systemStatus?.isActive && systemStatus?.canAcceptSessions
                    ? 'text-green-900'
                    : 'text-yellow-900'
                }`}>
                  {systemStatus?.isActive && systemStatus?.canAcceptSessions
                    ? 'System ACTIVE (Accepting Calls)'
                    : 'System INACTIVE (Waiting for Next Period)'}
                </h3>
                <p className={`text-sm ${
                  systemStatus?.isActive && systemStatus?.canAcceptSessions
                    ? 'text-green-800'
                    : 'text-yellow-800'
                }`}>
                  {systemStatus?.currentPeriod
                    ? `Current period: ${String(systemStatus.currentPeriod.start.hour).padStart(2, '0')}:${String(systemStatus.currentPeriod.start.minute).padStart(2, '0')} - ${String(systemStatus.currentPeriod.end.hour).padStart(2, '0')}:${String(systemStatus.currentPeriod.end.minute).padStart(2, '0')}`
                    : `Next schedule: ${String(systemStatus?.nextPeriod?.start.hour || 0).padStart(2, '0')}:${String(systemStatus?.nextPeriod?.start.minute || 0).padStart(2, '0')}`}
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ How to manage:</strong> To control when the system accepts calls, add or remove periods in the "Scheduled Times" section below.
            </p>
          </div>
        </div>

        {/* Statistics Grid */}
        {adminStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-copilot p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {adminStats.queueSize}
              </div>
              <div className="text-sm text-blue-800 font-semibold">Users in Queue</div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-copilot p-6 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {adminStats.activeSessionsCount}
              </div>
              <div className="text-sm text-green-800 font-semibold">Active Sessions</div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-copilot p-6 text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {adminStats.totalSessions}
              </div>
              <div className="text-sm text-purple-800 font-semibold">Total Sessions</div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-copilot p-6 text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">
                {systemStatus?.activePeriods?.length || 0}
              </div>
              <div className="text-sm text-yellow-800 font-semibold">Configured Periods</div>
            </div>
          </div>
        )}

        {/* Active Sessions Table */}
        {adminStats?.activeSessions && adminStats.activeSessions.length > 0 && (
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 mb-8">
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-6">
              Active Sessions ({adminStats.activeSessions.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-copilot-bg-primary">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-copilot-text-primary">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-copilot-text-primary">Start</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-copilot-text-primary">End</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-copilot-text-primary">Rooms</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-copilot-border-default">
                  {adminStats.activeSessions.map((session) => (
                    <tr key={session.sessionId}>
                      <td className="px-4 py-3 text-sm text-copilot-text-secondary font-mono">
                        {session.sessionId.substring(0, 20)}...
                      </td>
                      <td className="px-4 py-3 text-sm text-copilot-text-secondary">
                        {new Date(session.startTime).toLocaleTimeString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-copilot-text-secondary">
                        {session.endTime ? new Date(session.endTime).toLocaleTimeString('pt-BR') : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-copilot-text-primary font-semibold">
                        {session.rooms?.length || 0} rooms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Queue Users Table */}
        {adminStats?.queueUsers && adminStats.queueUsers.length > 0 && (
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 mb-8">
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-6">
              Users in Queue ({adminStats.queueUsers.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-copilot-bg-primary">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-copilot-text-primary">User ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-copilot-text-primary">Level</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-copilot-text-primary">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-copilot-border-default">
                  {adminStats.queueUsers.map((user) => (
                    <tr key={user.userId}>
                      <td className="px-4 py-3 text-sm text-copilot-text-secondary font-mono">
                        {user.userId.substring(0, 20)}...
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.level === 'beginner' ? 'bg-green-100 text-green-800' :
                          user.level === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {user.level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-copilot-text-secondary">
                        {new Date(user.joinedAt).toLocaleTimeString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Scheduled Periods */}
        {systemStatus?.activePeriods && (
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-copilot-text-primary">
                Scheduled Times (Timezone: America/Sao_Paulo)
              </h2>
              <button
                onClick={() => setShowAddPeriodForm(!showAddPeriodForm)}
                className="btn-copilot-primary flex items-center gap-2"
              >
                <span>➕</span>
                <span>{showAddPeriodForm ? 'Cancel' : 'Add Period'}</span>
              </button>
            </div>

            {/* Add Period Form */}
            {showAddPeriodForm && (
              <div className="bg-blue-50 border border-blue-200 rounded-copilot p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">New Period</h3>
                <form onSubmit={handleAddPeriod} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={2}
                        value={newPeriod.startHour}
                        onChange={(e) => setNewPeriod({ ...newPeriod, startHour: e.target.value.replace(/\D/g, '') })}
                        className="input-copilot w-20 text-center"
                        placeholder={t('common:placeholders.hours', 'HH')}
                      />
                      <span className="text-2xl text-gray-500">:</span>
                      <input
                        type="text"
                        maxLength={2}
                        value={newPeriod.startMinute}
                        onChange={(e) => setNewPeriod({ ...newPeriod, startMinute: e.target.value.replace(/\D/g, '') })}
                        className="input-copilot w-20 text-center"
                        placeholder={t('common:placeholders.minutes', 'MM')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={2}
                        value={newPeriod.endHour}
                        onChange={(e) => setNewPeriod({ ...newPeriod, endHour: e.target.value.replace(/\D/g, '') })}
                        className="input-copilot w-20 text-center"
                        placeholder={t('common:placeholders.hours', 'HH')}
                      />
                      <span className="text-2xl text-gray-500">:</span>
                      <input
                        type="text"
                        maxLength={2}
                        value={newPeriod.endMinute}
                        onChange={(e) => setNewPeriod({ ...newPeriod, endMinute: e.target.value.replace(/\D/g, '') })}
                        className="input-copilot w-20 text-center"
                        placeholder={t('common:placeholders.minutes', 'MM')}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="btn-copilot-primary w-full md:w-auto"
                    >
                      ✅ Add Period
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Periods List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemStatus.activePeriods.map((period, idx) => (
                <div key={idx} className="bg-copilot-bg-primary border border-copilot-border-default rounded-lg p-4 relative group">
                  <button
                    onClick={() => handleRemovePeriod(idx)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Remove period"
                  >
                    ✕
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📅</span>
                    <div>
                      <div className="text-sm text-copilot-text-secondary font-semibold">
                        Period {idx + 1}
                      </div>
                      <div className="text-lg font-mono text-copilot-text-primary">
                        {String(period.start.hour).padStart(2, '0')}:{String(period.start.minute).padStart(2, '0')} - {String(period.end.hour).padStart(2, '0')}:{String(period.end.minute).padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual Controls */}
        <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8">
          <h2 className="text-2xl font-bold text-copilot-text-primary mb-6">
            Manual Controls
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* System Controls */}
            <div className="bg-copilot-bg-primary border border-copilot-border-default rounded-copilot p-6">
              <h3 className="text-lg font-semibold text-copilot-text-primary mb-4 flex items-center gap-2">
                <span>⚙️</span>
                System Controls
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleDisableSystem}
                  className="w-full bg-red-500 text-white px-4 py-3 rounded-copilot hover:bg-red-600 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <span>🛑</span>
                  <span>Disable System</span>
                </button>
                
                <button
                  onClick={handleEnableSystem}
                  className="w-full bg-green-500 text-white px-4 py-3 rounded-copilot hover:bg-green-600 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <span>✅</span>
                  <span>Enable System</span>
                </button>
              </div>
            </div>

            {/* Queue Controls */}
            <div className="bg-copilot-bg-primary border border-copilot-border-default rounded-copilot p-6">
              <h3 className="text-lg font-semibold text-copilot-text-primary mb-4 flex items-center gap-2">
                <span>👥</span>
                Queue Controls
              </h3>
              
              <div className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-copilot p-3 mb-4">
                  <div className="text-sm text-yellow-800">
                    <strong>Current Queue:</strong> {adminStats?.queueCount || 0} users waiting
                  </div>
                </div>
                
                <button
                  onClick={handleClearQueue}
                  disabled={clearingQueue || (adminStats?.queueCount || 0) === 0}
                  className="w-full bg-orange-500 text-white px-4 py-3 rounded-copilot hover:bg-orange-600 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{clearingQueue ? '⏳' : '🗑️'}</span>
                  <span>{clearingQueue ? 'Clearing...' : 'Clear Queue'}</span>
                </button>
                
                <div className="text-xs text-copilot-text-secondary">
                  ⚠️ This will remove all users currently waiting for a session
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default VideoCallAdmin;

