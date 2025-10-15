import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Home from "../modules/auth-social/pages/Home";
import Login from "../modules/auth-social/pages/Login";
import UserProfile from "../modules/auth-social/pages/UserProfile";
import LandingPage from "../pages/LandingPage";
import PrivateRoute from "./PrivateRoute";

// English Course Pages
import EnglishDashboard from "../modules/english-course/pages/Dashboard";
import HowItWorks from "../modules/english-course/pages/HowItWorks";
import LessonsList from "../modules/english-course/pages/LessonsList";
import EnglishPractice from "../modules/english-course/pages/Practice";
import EnglishProgress from "../modules/english-course/pages/Progress";
import EnglishReview from "../modules/english-course/pages/Review";

// Admin Panel
import { AdminRoutes } from "../modules/admin";

// Video Call Module
import VideoCallRoutes from "../modules/video-call/VideoCallRoutes";

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

            {/* English Course Routes */}
            <Route
              path="/english-course"
              element={
                <PrivateRoute>
                  <EnglishDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/english-course/how-it-works"
              element={
                <PrivateRoute>
                  <HowItWorks />
                </PrivateRoute>
              }
            />
            <Route
              path="/english-course/lessons/:level"
              element={
                <PrivateRoute>
                  <LessonsList />
                </PrivateRoute>
              }
            />
            <Route
              path="/english-course/practice/:lessonId"
              element={
                <PrivateRoute>
                  <EnglishPractice />
                </PrivateRoute>
              }
            />
            <Route
              path="/english-course/review"
              element={
                <PrivateRoute>
                  <EnglishReview />
                </PrivateRoute>
              }
            />
            <Route
              path="/english-course/progress/:lessonId"
              element={
                <PrivateRoute>
                  <EnglishProgress />
                </PrivateRoute>
              }
            />

            {/* Admin Panel Routes (English Course + Video Call) */}
            <Route
              path="/admin/*"
              element={
                <PrivateRoute>
                  <AdminRoutes />
                </PrivateRoute>
              }
            />

            {/* Video Call Routes */}
            <Route
              path="/video-call/*"
              element={
                <PrivateRoute>
                  <VideoCallRoutes />
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
