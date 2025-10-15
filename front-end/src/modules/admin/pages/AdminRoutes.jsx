import { Route, Routes } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import VideoCallAdmin from './VideoCallAdmin';

// English Course Components
import LessonForm from '../components/english-course/LessonForm';
import LessonList from '../components/english-course/LessonList';
import QuestionForm from '../components/english-course/QuestionForm';
import QuestionList from '../components/english-course/QuestionList';
import UsersList from '../components/UsersList';
import EnglishCourseDashboard from './EnglishCourseDashboard';

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Main Admin Dashboard */}
      <Route path="/" element={<AdminDashboard />} />

      {/* English Course Admin */}
      <Route path="/english-course" element={<EnglishCourseDashboard />} />
      <Route path="/english-course/lessons" element={<LessonList />} />
      <Route path="/english-course/lessons/new" element={<LessonForm />} />
      <Route path="/english-course/lessons/:id/edit" element={<LessonForm />} />
      <Route path="/english-course/lessons/:lessonId/questions" element={<QuestionList />} />
      <Route path="/english-course/lessons/:lessonId/questions/new" element={<QuestionForm />} />
      <Route path="/english-course/lessons/:lessonId/questions/:questionId/edit" element={<QuestionForm />} />
      <Route path="/english-course/users" element={<UsersList />} />
      <Route path="/english-course/statistics" element={<div className="p-6">Statistics Page - Coming Soon</div>} />

      {/* Video Call Admin */}
      <Route path="/video-call" element={<VideoCallAdmin />} />
    </Routes>
  );
};

export default AdminRoutes;

