import { Route, Routes, Navigate } from 'react-router-dom';
import UsersList from '../components/UsersList';
import AdminDashboard from './AdminDashboard';
import EnglishCourseAdmin from './EnglishCourseAdmin';
import EnglishCourseProgressAdmin from './EnglishCourseProgressAdmin';
import VideoCallAdmin from './VideoCallAdmin';
import AdminUserManagement from '../../../pages/admin/AdminUserManagement';
import RemoteJobsAdminPage from './RemoteJobsAdminPage';

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Main Admin Dashboard */}
      <Route path="/" element={<AdminDashboard />} />

      {/* User Management */}
      <Route path="/users" element={<UsersList />} />

      {/* Role Management */}
      <Route path="/roles" element={<AdminUserManagement />} />

      {/* English Learning Module - Hierarchical Routes */}
      <Route path="/english-learning/video-call" element={<VideoCallAdmin />} />
      <Route path="/english-learning/course" element={<EnglishCourseAdmin />} />
      <Route path="/english-learning/progress" element={<EnglishCourseProgressAdmin />} />

      {/* Remote Jobs Module */}
      <Route path="/remote-jobs" element={<RemoteJobsAdminPage />} />

      {/* Legacy Routes - Redirect to new structure */}
      <Route path="/english-course" element={<Navigate to="/admin/english-learning/course" replace />} />
      <Route path="/english-course-progress" element={<Navigate to="/admin/english-learning/progress" replace />} />
      <Route path="/video-call-admin" element={<Navigate to="/admin/english-learning/video-call" replace />} />
    </Routes>
  );
};

export default AdminRoutes;

