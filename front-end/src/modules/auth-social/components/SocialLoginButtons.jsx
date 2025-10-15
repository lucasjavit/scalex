import { GoogleAuthProvider, OAuthProvider, signInWithPopup } from "firebase/auth";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebaseAuth";

export default function SocialLoginButtons() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();

  const handleLogin = async (provider) => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Botão Google */}
      <button
        onClick={() => handleLogin(new GoogleAuthProvider())}
        className="bg-white text-gray-900 font-semibold py-3 px-4 rounded-copilot hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-3 border border-gray-300 shadow-copilot hover:shadow-copilot-lg"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {t('login.signInWithGoogle')}
      </button>

      {/* Microsoft Button */}
      <button
        onClick={() => handleLogin(new OAuthProvider("microsoft.com"))}
        className="bg-copilot-bg-tertiary text-copilot-text-primary font-semibold py-3 px-4 rounded-copilot hover:bg-copilot-bg-hover transition-all duration-200 flex items-center justify-center gap-3 border border-copilot-border-default shadow-copilot hover:shadow-copilot-lg"
      >
        <svg width="20" height="20" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="10" height="10" fill="#f25022"/>
          <rect x="12" y="1" width="10" height="10" fill="#00a4ef"/>
          <rect x="1" y="12" width="10" height="10" fill="#7fba00"/>
          <rect x="12" y="12" width="10" height="10" fill="#ffb900"/>
        </svg>
        {t('login.signInWithMicrosoft')}
      </button>
    </div>
  );
}