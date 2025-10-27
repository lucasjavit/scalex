import { Route, Routes } from 'react-router-dom';
import UsersList from '../components/UsersList';
import AdminDashboard from './AdminDashboard';
import EnglishCourseAdmin from './EnglishCourseAdmin';
import EnglishCourseProgressAdmin from './EnglishCourseProgressAdmin';
import VideoCallAdmin from './VideoCallAdmin';

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Main Admin Dashboard */}
      <Route path="/" element={<AdminDashboard />} />

      {/* User Management */}
      <Route path="/users" element={<UsersList />} />

      {/* Video Call Admin */}
      <Route path="/video-call" element={<VideoCallAdmin />} />

      {/* English Course Admin */}
      <Route path="/english-course" element={<EnglishCourseAdmin />} />

      {/* English Course Progress Admin */}
      <Route path="/english-course-progress" element={<EnglishCourseProgressAdmin />} />
    </Routes>
  );
};

export default AdminRoutes;

