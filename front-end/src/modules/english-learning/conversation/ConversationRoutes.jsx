import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import HowItWorks from './pages/HowItWorks';
import Matching from './pages/Matching';
import VideoCallRoom from './pages/VideoCallRoom';
import WaitingQueue from './pages/WaitingQueue';

const ConversationRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/matching" element={<Matching />} />
      <Route path="/waiting-queue" element={<WaitingQueue />} />
      <Route path="/room/:roomId" element={<VideoCallRoom />} />
    </Routes>
  );
};

export default ConversationRoutes;
