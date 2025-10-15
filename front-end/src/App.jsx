import './i18n'; // Initialize i18n
import { AuthProvider } from "./modules/auth-social/context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
