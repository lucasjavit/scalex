import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import LessonList from '../components/LessonList';
import LessonForm from '../components/LessonForm';
import QuestionList from '../components/QuestionList';
import QuestionForm from '../components/QuestionForm';

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="/" element={<AdminDashboard />} />
      
      {/* Lessons */}
      <Route path="/lessons" element={<LessonList />} />
      <Route path="/lessons/new" element={<LessonForm />} />
      <Route path="/lessons/:id/edit" element={<LessonForm />} />
      
      {/* Questions */}
      <Route path="/lessons/:lessonId/questions" element={<QuestionList />} />
      <Route path="/lessons/:lessonId/questions/new" element={<QuestionForm />} />
      <Route path="/lessons/:lessonId/questions/:questionId/edit" element={<QuestionForm />} />
      
      {/* Future routes */}
      <Route path="/statistics" element={<div>Statistics Page - Coming Soon</div>} />
      <Route path="/users" element={<div>Users Management - Coming Soon</div>} />
      <Route path="/settings" element={<div>Settings - Coming Soon</div>} />
    </Routes>
  );
};

export default AdminRoutes;
