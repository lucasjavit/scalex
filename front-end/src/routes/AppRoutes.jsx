import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "../modules/auth-social/pages/Home";
import Login from "../modules/auth-social/pages/Login";
import PrivateRoute from "./PrivateRoute";
import Navbar from "../components/Navbar";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
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
      </Routes>
    </BrowserRouter>
  );
}
