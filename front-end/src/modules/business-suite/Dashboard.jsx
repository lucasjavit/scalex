import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';

export default function BusinessSuiteDashboard() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const modules = [
    {
      id: 'accounting',
      icon: '📊',
      title: t('business.accounting.title', 'Contabilidade'),
      description: t('business.accounting.description', 'Crie seu CNPJ e escolha seu contador'),
      route: '/business/accounting',
      gradient: 'from-blue-500 to-cyan-500',
      status: 'coming-soon'
    },
    {
      id: 'career',
      icon: '💼',
      title: t('business.career.title', 'Consultoria de Carreira'),
      description: t('business.career.description', 'Melhore seu LinkedIn e Currículo'),
      route: '/business/career',
      gradient: 'from-purple-500 to-pink-500',
      status: 'coming-soon'
    },
    {
      id: 'jobs',
      icon: '🌍',
      title: t('business.jobs.title', 'Vagas Remotas'),
      description: t('business.jobs.description', 'Encontre trabalho remoto no Brasil e exterior'),
      route: '/business/jobs',
      gradient: 'from-red-500 to-pink-500',
      status: 'coming-soon'
    },
    {
      id: 'insurance',
      icon: '🛡️',
      title: t('business.insurance.title', 'Seguros'),
      description: t('business.insurance.description', 'Planos de saúde e seguros de afastamento'),
      route: '/business/insurance',
      gradient: 'from-indigo-500 to-blue-500',
      status: 'coming-soon'
    },
    {
      id: 'banking',
      icon: '💰',
      title: t('business.banking.title', 'Banco Digital'),
      description: t('business.banking.description', 'Receba do exterior e solicite empréstimos'),
      route: '/business/banking',
      gradient: 'from-teal-500 to-cyan-500',
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
          <h1 className="text-4xl font-bold text-copilot-text-primary mb-3">
            {t('business.title', 'Business Suite')}
          </h1>

          <p className="text-copilot-text-secondary text-lg">
            {t('business.subtitle', 'Ferramentas completas para trabalhar como PJ no exterior')}
          </p>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <ModuleCard key={module.id} {...module} onClick={() => navigate(module.route)} />
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold text-copilot-text-primary mb-4">
            {t('business.comingSoon', '🚀 Módulos em Desenvolvimento')}
          </h3>
          <p className="text-copilot-text-secondary mb-6">
            {t('business.comingSoonDescription', 'Estamos trabalhando para trazer todas essas funcionalidades em breve. Fique atento às atualizações!')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              title={t('business.feature1.title', 'Ecossistema Completo')}
              description={t('business.feature1.description', 'Tudo que você precisa para trabalhar como PJ')}
            />
            <FeatureCard
              title={t('business.feature2.title', 'Profissionais Certificados')}
              description={t('business.feature2.description', 'Contadores e consultores qualificados')}
            />
            <FeatureCard
              title={t('business.feature3.title', 'Integração Internacional')}
              description={t('business.feature3.description', 'Receba do exterior com facilidade')}
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
      className={`relative rounded-copilot p-6 transition-all duration-200 group ${
        isComingSoon
          ? 'opacity-60 cursor-not-allowed bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600'
          : 'cursor-pointer bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 shadow-lg hover:shadow-xl hover:from-slate-600 hover:to-slate-700'
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

// Feature Card Component
function FeatureCard({ title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-copilot-accent-success bg-opacity-20 rounded-copilot flex items-center justify-center flex-shrink-0">
        <span className="text-copilot-accent-success text-xl">✓</span>
      </div>
      <div>
        <h4 className="font-bold text-copilot-text-primary mb-1">{title}</h4>
        <p className="text-copilot-text-secondary text-sm">{description}</p>
      </div>
    </div>
  );
}
