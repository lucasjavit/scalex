import { Navigate } from "react-router-dom";
import { useAuth } from "../modules/auth-social/context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
}
