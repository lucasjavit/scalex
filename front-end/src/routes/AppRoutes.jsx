import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Home from "../modules/auth-social/pages/Home";
import Login from "../modules/auth-social/pages/Login";
import UserProfile from "../modules/auth-social/pages/UserProfile";
import PrivateRoute from "./PrivateRoute";

// English Course Pages
import EnglishDashboard from "../modules/english-course/pages/Dashboard";
import EnglishPractice from "../modules/english-course/pages/Practice";
import EnglishReview from "../modules/english-course/pages/Review";
import EnglishProgress from "../modules/english-course/pages/Progress";
import LessonsList from "../modules/english-course/pages/LessonsList";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Login />} />
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
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
