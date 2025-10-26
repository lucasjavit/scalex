import { Route, Routes } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import VideoCallAdmin from './VideoCallAdmin';
import UsersList from '../components/UsersList';

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Main Admin Dashboard */}
      <Route path="/" element={<AdminDashboard />} />

      {/* User Management */}
      <Route path="/users" element={<UsersList />} />

      {/* Video Call Admin */}
      <Route path="/video-call" element={<VideoCallAdmin />} />
    </Routes>
  );
};

export default AdminRoutes;

