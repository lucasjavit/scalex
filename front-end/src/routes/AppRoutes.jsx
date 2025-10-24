import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Home from "../modules/auth-social/pages/Home";
import Login from "../modules/auth-social/pages/Login";
import UserProfile from "../modules/auth-social/pages/UserProfile";
import LandingPage from "../pages/LandingPage";
import PrivateRoute from "./PrivateRoute";

// Coming Soon Page Component
function ComingSoonPage({ moduleName, moduleIcon }) {
  const navigate = useNavigate();

  return (
    <div className="bg-copilot-bg-primary min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        <div className="inline-block bg-copilot-gradient p-6 rounded-copilot-lg mb-6 shadow-copilot-xl">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <span className="text-6xl">{moduleIcon}</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-copilot-text-primary mb-4">
          {moduleName}
        </h1>

        <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 rounded-copilot p-4 mb-6">
          <p className="text-yellow-600 dark:text-yellow-400 font-semibold text-lg">
            🚧 Módulo em Desenvolvimento
          </p>
        </div>

        <p className="text-copilot-text-secondary text-lg mb-8">
          Este módulo está sendo desenvolvido e será lançado em breve.
          <br />
          Fique atento às atualizações!
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/home')}
            className="btn-copilot-primary"
          >
            ← Voltar para Home
          </button>
        </div>

        {/* Features Preview */}
        <div className="mt-12 pt-8 border-t border-copilot-border-default">
          <h3 className="text-xl font-bold text-copilot-text-primary mb-4">
            Em breve você poderá:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <FeatureItem text="Acessar funcionalidades completas" />
            <FeatureItem text="Gerenciar suas informações" />
            <FeatureItem text="Conectar com profissionais" />
            <FeatureItem text="Acompanhar seu progresso" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text }) {
  return (
    <div className="flex items-start gap-3 bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-3">
      <span className="text-green-500 text-xl flex-shrink-0">✓</span>
      <span className="text-copilot-text-secondary">{text}</span>
    </div>
  );
}

// Macro-Modules Dashboards
import EnglishLearningDashboard from "../modules/english-learning/Dashboard";
import BusinessSuiteDashboard from "../modules/business-suite/Dashboard";

// English Learning - Course Module
import EnglishCourseDashboard from "../modules/english-learning/course/pages/Dashboard";
import CourseHowItWorks from "../modules/english-learning/course/pages/HowItWorks";
import CourseLessonsList from "../modules/english-learning/course/pages/LessonsList";
import CoursePractice from "../modules/english-learning/course/pages/Practice";
import CourseProgress from "../modules/english-learning/course/pages/Progress";
import CourseReview from "../modules/english-learning/course/pages/Review";

// English Learning - Conversation Module
import ConversationRoutes from "../modules/english-learning/conversation/ConversationRoutes";

// Admin Panel
import { AdminRoutes } from "../modules/admin";

// Test Environment Variables
import TestEnv from "../test-env";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <UserProfile />
                </PrivateRoute>
              }
            />

            {/* MACRO-MODULE 1: English Learning */}
            <Route
              path="/learning"
              element={
                <PrivateRoute>
                  <EnglishLearningDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/learning/course"
              element={
                <PrivateRoute>
                  <EnglishCourseDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/learning/conversation/*"
              element={
                <PrivateRoute>
                  <ConversationRoutes />
                </PrivateRoute>
              }
            />
            <Route
              path="/learning/teachers"
              element={
                <PrivateRoute>
                  <ComingSoonPage moduleName="Professores de Inglês" moduleIcon="👨‍🏫" />
                </PrivateRoute>
              }
            />

            {/* MACRO-MODULE 2: Business Suite */}
            <Route
              path="/business"
              element={
                <PrivateRoute>
                  <BusinessSuiteDashboard />
                </PrivateRoute>
              }
            />

            {/* Course Sub-Routes */}
            <Route
              path="/learning/course/how-it-works"
              element={
                <PrivateRoute>
                  <CourseHowItWorks />
                </PrivateRoute>
              }
            />
            <Route
              path="/learning/course/lessons/:level"
              element={
                <PrivateRoute>
                  <CourseLessonsList />
                </PrivateRoute>
              }
            />
            <Route
              path="/learning/course/practice/:lessonId"
              element={
                <PrivateRoute>
                  <CoursePractice />
                </PrivateRoute>
              }
            />
            <Route
              path="/learning/course/review"
              element={
                <PrivateRoute>
                  <CourseReview />
                </PrivateRoute>
              }
            />
            <Route
              path="/learning/course/progress/:lessonId"
              element={
                <PrivateRoute>
                  <CourseProgress />
                </PrivateRoute>
              }
            />

            {/* LEGACY ROUTES (Backward Compatibility) - Keep for now */}
            <Route
              path="/english-course"
              element={
                <PrivateRoute>
                  <EnglishCourseDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/english-course/how-it-works"
              element={
                <PrivateRoute>
                  <CourseHowItWorks />
                </PrivateRoute>
              }
            />
            <Route
              path="/english-course/lessons/:level"
              element={
                <PrivateRoute>
                  <CourseLessonsList />
                </PrivateRoute>
              }
            />
            <Route
              path="/english-course/practice/:lessonId"
              element={
                <PrivateRoute>
                  <CoursePractice />
                </PrivateRoute>
              }
            />
            <Route
              path="/english-course/review"
              element={
                <PrivateRoute>
                  <CourseReview />
                </PrivateRoute>
              }
            />
            <Route
              path="/english-course/progress/:lessonId"
              element={
                <PrivateRoute>
                  <CourseProgress />
                </PrivateRoute>
              }
            />

            {/* Video Call LEGACY Routes */}
            <Route
              path="/video-call/*"
              element={
                <PrivateRoute>
                  <ConversationRoutes />
                </PrivateRoute>
              }
            />

            {/* Admin Panel Routes */}
            <Route
              path="/admin/*"
              element={
                <PrivateRoute>
                  <AdminRoutes />
                </PrivateRoute>
              }
            />

            {/* New Modules - Placeholder Routes */}
            <Route
              path="/accounting/*"
              element={
                <PrivateRoute>
                  <ComingSoonPage moduleName="Contabilidade" moduleIcon="📊" />
                </PrivateRoute>
              }
            />
            <Route
              path="/career/*"
              element={
                <PrivateRoute>
                  <ComingSoonPage moduleName="Consultoria de Carreira" moduleIcon="💼" />
                </PrivateRoute>
              }
            />
            <Route
              path="/jobs/*"
              element={
                <PrivateRoute>
                  <ComingSoonPage moduleName="Vagas Remotas" moduleIcon="🌍" />
                </PrivateRoute>
              }
            />
            <Route
              path="/insurance/*"
              element={
                <PrivateRoute>
                  <ComingSoonPage moduleName="Seguros" moduleIcon="🛡️" />
                </PrivateRoute>
              }
            />
            <Route
              path="/banking/*"
              element={
                <PrivateRoute>
                  <ComingSoonPage moduleName="Banco Digital" moduleIcon="💰" />
                </PrivateRoute>
              }
            />

            {/* Test Environment Variables - Remove in production */}
            <Route path="/test-env" element={<TestEnv />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
