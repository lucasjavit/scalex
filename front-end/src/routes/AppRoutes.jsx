import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Home from "../modules/auth-social/pages/Home";
import Login from "../modules/auth-social/pages/Login";
import UserProfile from "../modules/auth-social/pages/UserProfile";
import LandingPage from "../pages/LandingPage";
import CompleteRegistration from "../pages/CompleteRegistration";
import PrivateRoute from "./PrivateRoute";
import EnglishLearningRoute from "../components/EnglishLearningRoute";

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

// Macro-Modules Dashboards - Removed (direct navigation only)

// English Learning - Conversation Module
import ConversationRoutes from "../modules/english-learning/conversation/ConversationRoutes";

// English Learning - Course Module
import CourseDashboard from "../modules/english-learning/course/pages/CourseDashboard";
import StageView from "../modules/english-learning/course/pages/StageView";
import UnitView from "../modules/english-learning/course/pages/UnitView";
import ReviewSession from "../modules/english-learning/course/pages/ReviewSession";

// Admin Panel
import { AdminRoutes } from "../modules/admin";
import UserPermissionsManagement from "../pages/AdminPanel/UserPermissionsManagement";
import UserRolesManagement from "../pages/AdminPanel/UserRolesManagement";

// Test Environment Variables
import TestEnv from "../test-env";

// Remote Jobs Module
import JobsPage from "../modules/remote-jobs/pages/JobsPage";
import SavedJobsPage from "../modules/remote-jobs/pages/SavedJobsPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/complete-registration" element={<CompleteRegistration />} />
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

            {/* MACRO-MODULE 1: English Learning - Direct Routes Only */}
            <Route
              path="/learning/conversation/*"
              element={
                <EnglishLearningRoute>
                  <ConversationRoutes />
                </EnglishLearningRoute>
              }
            />
            <Route
              path="/learning/course"
              element={
                <EnglishLearningRoute>
                  <CourseDashboard />
                </EnglishLearningRoute>
              }
            />
            <Route
              path="/learning/course/stages/:stageId"
              element={
                <EnglishLearningRoute>
                  <StageView />
                </EnglishLearningRoute>
              }
            />
            <Route
              path="/learning/course/units/:unitId"
              element={
                <EnglishLearningRoute>
                  <UnitView />
                </EnglishLearningRoute>
              }
            />
            <Route
              path="/learning/course/review"
              element={
                <EnglishLearningRoute>
                  <ReviewSession />
                </EnglishLearningRoute>
              }
            />

            {/* Video Call LEGACY Routes */}
            <Route
              path="/video-call/*"
              element={
                <EnglishLearningRoute>
                  <ConversationRoutes />
                </EnglishLearningRoute>
              }
            />

            {/* Admin Panel Routes */}
            <Route
              path="/admin/permissions"
              element={
                <PrivateRoute>
                  <UserPermissionsManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/roles"
              element={
                <PrivateRoute>
                  <UserRolesManagement />
                </PrivateRoute>
              }
            />
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
            {/* Remote Jobs Module */}
            <Route
              path="/jobs"
              element={
                <PrivateRoute>
                  <JobsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/jobs/saved"
              element={
                <PrivateRoute>
                  <SavedJobsPage />
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
