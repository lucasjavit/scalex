import { Route, Routes } from 'react-router-dom';
import LessonForm from '../components/LessonForm';
import LessonList from '../components/LessonList';
import QuestionForm from '../components/QuestionForm';
import QuestionList from '../components/QuestionList';
import UsersList from '../components/UsersList';
import AdminDashboard from './AdminDashboard';

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
      
      {/* Users */}
      <Route path="/users" element={<UsersList />} />
      
      {/* Future routes */}
      <Route path="/statistics" element={<div>Statistics Page - Coming Soon</div>} />
      <Route path="/settings" element={<div>Settings - Coming Soon</div>} />
    </Routes>
  );
};

export default AdminRoutes;
