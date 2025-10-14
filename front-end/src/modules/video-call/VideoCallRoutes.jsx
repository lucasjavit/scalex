import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Matching from './pages/Matching';
import VideoCallAdmin from './pages/VideoCallAdmin';
import VideoCallDashboard from './pages/VideoCallDashboard';
import VideoCallRoom from './pages/VideoCallRoom';
import WaitingQueue from './pages/WaitingQueue';

const VideoCallRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<VideoCallDashboard />} />
      <Route path="/matching" element={<Matching />} />
      <Route path="/waiting-queue" element={<WaitingQueue />} />
      <Route path="/room/:roomId" element={<VideoCallRoom />} />
      <Route path="/admin" element={<VideoCallAdmin />} />
    </Routes>
  );
};

export default VideoCallRoutes;
