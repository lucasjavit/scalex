import { Route, Routes } from 'react-router-dom';
import UsersList from '../components/UsersList';
import AdminDashboard from './AdminDashboard';
import EnglishCourseAdmin from './EnglishCourseAdmin';
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
    </Routes>
  );
};

export default AdminRoutes;

