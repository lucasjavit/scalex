import { Navigate } from "react-router-dom";
import ActiveUserGuard from "../components/ActiveUserGuard";
import { useAuth } from "../modules/auth-social/context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <ActiveUserGuard>
      {children}
    </ActiveUserGuard>
  );
}
