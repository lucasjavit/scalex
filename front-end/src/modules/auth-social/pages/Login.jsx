import { useTranslation } from 'react-i18next';
import SocialLoginButtons from "../components/SocialLoginButtons";

export default function Login() {
  const { t } = useTranslation('auth');
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-copilot-bg-primary">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-copilot-accent-purple opacity-5 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-copilot-accent-blue opacity-5 blur-3xl rounded-full"></div>
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-md">
        <div className="bg-copilot-bg-secondary border border-copilot-border-default p-8 rounded-copilot-lg shadow-copilot-xl backdrop-blur-md">
          {/* Logo/Icon section */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-copilot-gradient rounded-copilot-lg flex items-center justify-center shadow-copilot-lg">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          {/* Title and description */}
          <h1 className="text-3xl font-bold mb-3 text-center text-copilot-text-primary">
            {t('login.title')}
          </h1>
          <p className="text-copilot-text-secondary text-sm mb-8 text-center leading-relaxed">
            {t('login.subtitle')}
          </p>

          {/* Login buttons */}
          <SocialLoginButtons />

          {/* Footer text */}
          <div className="mt-8 pt-6 border-t border-copilot-border-default">
            <p className="text-center text-copilot-text-tertiary text-xs">
              {t('login.byLoggingIn')}{" "}
              <a href="#" className="text-copilot-accent-primary hover:underline">
                {t('login.termsOfService')}
              </a>{" "}
              {t('login.and')}{" "}
              <a href="#" className="text-copilot-accent-primary hover:underline">
                {t('login.privacyPolicy')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
