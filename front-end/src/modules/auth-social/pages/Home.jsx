import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import BackButton from '../../../components/BackButton';
import { useIsAdmin } from "../../../hooks/useIsAdmin";
import apiService from "../../../services/api";
import { useAuth } from "../context/AuthContext";

// MacroModuleCard Component
function MacroModuleCard({ icon, gradient, title, description, onClick, status = 'active', disabledReason }) {
  const isComingSoon = status === 'coming-soon';
  const isDisabled = status === 'disabled';

  return (
    <div
      className={`relative rounded-copilot p-6 transition-all duration-200 group ${
        isComingSoon || isDisabled
          ? 'opacity-60 cursor-not-allowed bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600'
          : 'cursor-pointer bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 shadow-lg hover:shadow-xl hover:from-slate-600 hover:to-slate-700'
      }`}
      onClick={isComingSoon || isDisabled ? undefined : onClick}
      title={isDisabled ? disabledReason : undefined}
    >
      {/* Coming Soon Badge */}
      {isComingSoon && (
        <div className="absolute top-3 right-3 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-copilot">
          Em breve
        </div>
      )}

      {/* Disabled Badge */}
      {isDisabled && (
        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-copilot">
          Indisponível
        </div>
      )}

      {/* Icon */}
      <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-copilot flex items-center justify-center mb-4 shadow-copilot ${
        !isComingSoon && !isDisabled && 'group-hover:scale-110'
      } transition-transform duration-200`}>
        <span className="text-white text-3xl">{icon}</span>
      </div>

      {/* Title */}
      <h3 className="font-bold text-lg mb-2 text-copilot-text-primary">
        {title}
      </h3>

      {/* Description */}
      <p className="text-copilot-text-secondary text-sm mb-4 min-h-[3rem]">
        {description}
      </p>

      {/* Disabled Reason */}
      {isDisabled && disabledReason && (
        <p className="text-red-400 text-xs mb-2 italic">
          {disabledReason}
        </p>
      )}

      {/* Action */}
      {!isComingSoon && !isDisabled && (
        <div className="flex items-center text-copilot-accent-primary text-sm font-medium">
          <span>Acessar</span>
          <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();
  const [conversationAvailable, setConversationAvailable] = useState(true);
  const [conversationDisabledReason, setConversationDisabledReason] = useState('');

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

  // Check if video call feature is available (not at usage limit)
  useEffect(() => {
    const checkFeatureAvailability = async () => {
      try {
        const baseURL = import.meta?.env?.VITE_API_URL ?? 'http://localhost:3000';
        const token = await user?.getIdToken();

        const response = await fetch(`${baseURL}/api/english-learning/video-call/feature-availability`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (result.success && result.data) {
          setConversationAvailable(result.data.available);
          if (!result.data.available) {
            setConversationDisabledReason(result.data.reason || 'Limite de uso atingido');
          }
        }
      } catch (error) {
        console.error('Error checking feature availability:', error);
        // On error, assume it's available to not block users unnecessarily
        setConversationAvailable(true);
      }
    };

    if (user) {
      checkFeatureAvailability();
    }
  }, [user]);

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


        {/* Macro-Module 1: English Learning */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-copilot flex items-center justify-center shadow-copilot">
              <span className="text-white text-2xl">📚</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-copilot-text-primary">
                {t('home.learning.title', 'English Learning')}
              </h2>
              <p className="text-copilot-text-secondary text-sm">
                {t('home.learning.subtitle', 'Aprenda e pratique inglês')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MacroModuleCard
              icon="📖"
              gradient="from-green-500 to-emerald-500"
              title={t('home.learning.course', 'Aulas de Inglês')}
              description={t('home.learning.courseDesc', 'Sistema de spaced repetition')}
              onClick={() => navigate('/learning/course')}
              status="active"
            />
            <MacroModuleCard
              icon="💬"
              gradient="from-yellow-500 to-orange-500"
              title={t('home.learning.conversation', 'Conversação')}
              description={t('home.learning.conversationDesc', 'Pratique com outros usuários')}
              onClick={() => navigate('/learning/conversation')}
              status={conversationAvailable ? 'active' : 'disabled'}
              disabledReason={conversationDisabledReason}
            />
            <MacroModuleCard
              icon="👨‍🏫"
              gradient="from-blue-500 to-cyan-500"
              title={t('home.learning.teachers', 'Professores')}
              description={t('home.learning.teachersDesc', 'Aulas particulares')}
              onClick={() => navigate('/learning/teachers')}
              status="coming-soon"
            />
          </div>

          <div className="mt-6 text-center">
            <BackButton 
              to="/learning" 
              label={t('home.learning.viewAll', 'Ver todos os módulos')}
              className="inline-flex"
            />
          </div>
        </section>

        {/* Macro-Module 2: Business Suite */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-copilot flex items-center justify-center shadow-copilot">
              <span className="text-white text-2xl">💼</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-copilot-text-primary">
                {t('home.business.title', 'Business Suite')}
              </h2>
              <p className="text-copilot-text-secondary text-sm">
                {t('home.business.subtitle', 'Ferramentas para trabalhar como PJ')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MacroModuleCard
              icon="📊"
              gradient="from-blue-500 to-cyan-500"
              title={t('home.business.accounting', 'Contabilidade')}
              description={t('home.business.accountingDesc', 'CNPJ e contador')}
              onClick={() => navigate('/business/accounting')}
              status="coming-soon"
            />
            <MacroModuleCard
              icon="💼"
              gradient="from-purple-500 to-pink-500"
              title={t('home.business.career', 'Consultoria')}
              description={t('home.business.careerDesc', 'LinkedIn e currículo')}
              onClick={() => navigate('/business/career')}
              status="coming-soon"
            />
            <MacroModuleCard
              icon="🌍"
              gradient="from-red-500 to-pink-500"
              title={t('home.business.jobs', 'Vagas Remotas')}
              description={t('home.business.jobsDesc', 'Trabalho internacional')}
              onClick={() => navigate('/business/jobs')}
              status="coming-soon"
            />
            <MacroModuleCard
              icon="🛡️"
              gradient="from-indigo-500 to-blue-500"
              title={t('home.business.insurance', 'Seguros')}
              description={t('home.business.insuranceDesc', 'Planos e proteção')}
              onClick={() => navigate('/business/insurance')}
              status="coming-soon"
            />
            <MacroModuleCard
              icon="💰"
              gradient="from-teal-500 to-cyan-500"
              title={t('home.business.banking', 'Banco Digital')}
              description={t('home.business.bankingDesc', 'Pagamentos internacionais')}
              onClick={() => navigate('/business/banking')}
              status="coming-soon"
            />
          </div>

          <div className="mt-6 text-center">
            <BackButton 
              to="/business" 
              label={t('home.business.viewAll', 'Ver todos os módulos')}
              className="inline-flex"
            />
          </div>
        </section>
      </main>
    </div>
  );
}