import NotificationContainer from "./components/NotificationContainer";
import { NotificationProvider } from "./contexts/NotificationContext";
import './i18n'; // Initialize i18n
import { AuthProvider } from "./modules/auth-social/context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes />
        <NotificationContainer />
      </NotificationProvider>
    </AuthProvider>
  );
}
