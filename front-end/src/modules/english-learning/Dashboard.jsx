import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';

export default function EnglishLearningDashboard() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const modules = [
    {
      id: 'course',
      icon: '📚',
      title: t('learning.course.title', 'Curso de Inglês'),
      description: t('learning.course.description', 'Aprenda inglês com vídeos e flashcards inteligentes'),
      route: '/learning/course',
      gradient: 'from-purple-500 to-pink-500',
      status: 'active'
    },
    {
      id: 'conversation',
      icon: '💬',
      title: t('learning.conversation.title', 'Conversação'),
      description: t('learning.conversation.description', 'Pratique inglês com outros usuários via Zoom'),
      route: '/learning/conversation',
      gradient: 'from-yellow-500 to-orange-500',
      status: 'active'
    },
    {
      id: 'teachers',
      icon: '👨‍🏫',
      title: t('learning.teachers.title', 'Professores'),
      description: t('learning.teachers.description', 'Aulas particulares com professores qualificados'),
      route: '/learning/teachers',
      gradient: 'from-blue-500 to-cyan-500',
      status: 'coming-soon'
    }
  ];

  return (
    <div className="bg-copilot-bg-primary min-h-screen">
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <BackButton to="/home" label={t('common:navigation.backToHome', 'Voltar para Home')} />

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-copilot-gradient p-4 rounded-copilot-lg mb-6 shadow-copilot-lg">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-5xl">📚</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-copilot-text-primary mb-3">
            {t('learning.title', 'English Learning')}
          </h1>

          <p className="text-copilot-text-secondary text-lg">
            {t('learning.subtitle', 'Aprenda e pratique inglês de forma eficiente')}
          </p>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <ModuleCard key={module.id} {...module} onClick={() => navigate(module.route)} />
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8">
          <h3 className="text-xl font-bold text-copilot-text-primary mb-4">
            {t('learning.howItWorks', 'Como Funciona')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard
              number="1"
              title={t('learning.step1.title', 'Aprenda')}
              description={t('learning.step1.description', 'Estude com nosso sistema de spaced repetition')}
            />
            <StepCard
              number="2"
              title={t('learning.step2.title', 'Pratique')}
              description={t('learning.step2.description', 'Converse com outros usuários ou professores')}
            />
            <StepCard
              number="3"
              title={t('learning.step3.title', 'Evolua')}
              description={t('learning.step3.description', 'Acompanhe seu progresso e alcance fluência')}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// Module Card Component
function ModuleCard({ icon, gradient, title, description, onClick, status }) {
  const isComingSoon = status === 'coming-soon';

  return (
    <div
      className={`relative bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot shadow-copilot p-6 transition-all duration-200 group ${
        isComingSoon
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:border-copilot-accent-primary cursor-pointer hover:shadow-copilot-xl'
      }`}
      onClick={isComingSoon ? undefined : onClick}
    >
      {isComingSoon && (
        <div className="absolute top-3 right-3 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-copilot">
          Em breve
        </div>
      )}

      <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-copilot flex items-center justify-center mb-4 shadow-copilot ${
        !isComingSoon && 'group-hover:scale-110'
      } transition-transform duration-200`}>
        <span className="text-white text-3xl">{icon}</span>
      </div>

      <h3 className="font-bold text-lg mb-2 text-copilot-text-primary">{title}</h3>
      <p className="text-copilot-text-secondary text-sm mb-4 min-h-[3rem]">{description}</p>

      {!isComingSoon && (
        <div className="flex items-center text-copilot-accent-primary text-sm font-medium">
          <span>Acessar</span>
          <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
        </div>
      )}
    </div>
  );
}

// Step Card Component
function StepCard({ number, title, description }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-copilot-gradient rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
        {number}
      </div>
      <h4 className="font-bold text-copilot-text-primary mb-2">{title}</h4>
      <p className="text-copilot-text-secondary text-sm">{description}</p>
    </div>
  );
}
