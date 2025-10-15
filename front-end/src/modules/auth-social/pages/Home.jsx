import { useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "../../../hooks/useIsAdmin";
import apiService from "../../../services/api";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();

  // Check if user has profile data and redirect accordingly
  useEffect(() => {
    const checkUserProfile = async () => {
      if (!user) return;

      try {
        const existingUser = await apiService.checkUserExists(user.uid);
        if (!existingUser) {
          // User doesn't have profile data, redirect to profile page
          navigate('/profile');
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        // On error, redirect to profile page to be safe
        navigate('/profile');
      }
    };

    checkUserProfile();
  }, [user, navigate]);

  return (
    <div className="bg-copilot-bg-primary">


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          
          <h1 className="text-4xl font-bold text-copilot-text-primary mb-3">
            {t('home.welcomeBack')}
            {user?.displayName && (
              <span className="bg-copilot-gradient bg-clip-text text-transparent">
                , {user.displayName}
              </span>
            )}!
          </h1>

          <p className="text-copilot-text-secondary text-lg">
            {t('home.exploreFeatures')}
          </p>
        </div>


        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* English Course Card */}
          <div 
            className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot shadow-copilot p-6 hover:border-copilot-accent-primary transition-all duration-200 cursor-pointer group"
            onClick={() => navigate('/english-course')}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-copilot flex items-center justify-center mb-4 shadow-copilot group-hover:scale-110 transition-transform duration-200">
              <span className="text-white text-2xl">🇬🇧</span>
            </div>
            <h3 className="font-bold text-lg mb-2 text-copilot-text-primary">{t('home.englishCourse.title')}</h3>
            <p className="text-copilot-text-secondary text-sm">
              {t('home.englishCourse.description')}
            </p>
            <div className="mt-4 flex items-center text-copilot-accent-primary text-sm font-medium">
              <span>{t('buttons.getStarted')}</span>
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
            </div>
          </div>

          {/* Video Call Card */}
          <div
            className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot shadow-copilot p-6 hover:border-copilot-accent-primary transition-all duration-200 cursor-pointer group"
            onClick={() => navigate('/video-call')}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-copilot flex items-center justify-center mb-4 shadow-copilot group-hover:scale-110 transition-transform duration-200">
              <span className="text-white text-2xl">🎥</span>
            </div>
            <h3 className="font-bold text-lg mb-2 text-copilot-text-primary">{t('home.videoCall.title')}</h3>
            <p className="text-copilot-text-secondary text-sm">
              {t('home.videoCall.description')}
            </p>
            <div className="mt-4 flex items-center text-copilot-accent-primary text-sm font-medium">
              <span>{t('buttons.getStarted')}</span>
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}