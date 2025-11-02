import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import LanguageSelector from '../components/LanguageSelector';

export default function LandingPage() {
  const { t } = useTranslation('landing');
  const navigate = useNavigate();

  // Theme toggle state (persisted)
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'night';
    return localStorage.getItem('theme') || 'night';
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    if (theme === 'day') body.classList.add('theme-day'); else body.classList.remove('theme-day');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'day' ? 'night' : 'day'));

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-copilot-bg-primary">
      {/* Top Right Controls - Fixed Position */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        {/* Language Selector */}
        <div className="bg-copilot-bg-secondary border-2 border-copilot-border-primary rounded-full shadow-lg">
          <LanguageSelector />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-12 h-12 rounded-full bg-copilot-bg-secondary border-2 border-copilot-border-primary hover:border-copilot-border-focus hover:bg-copilot-bg-tertiary transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center text-2xl"
          title={theme === 'day' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
          aria-label={theme === 'day' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
        >
          {theme === 'day' ? '🌙' : '🌤️'}
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-copilot-bg-secondary">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20" style={{ overflow: 'visible' }}>
          <div className="text-center">
            {/* Logo/Brand */}
            <div className="mb-8">
              <h1 
                className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                  fontFeatureSettings: '"liga" 1, "kern" 1',
                  textRendering: 'optimizeLegibility',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale'
                }}
              >
                Scallex
              </h1>
            <p className="text-xl text-copilot-text-secondary font-medium">
              {t('hero.tagline')}
            </p>
          </div>

          {/* Main Headline */}
          <h2 className="text-5xl md:text-6xl font-bold text-copilot-text-primary mb-6 leading-tight" style={{ overflow: 'visible' }}>
            {t('hero.headline')}
            <span
              className="block"
              style={{
                background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                fontFeatureSettings: '"liga" 1, "kern" 1',
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                lineHeight: '1.3',
                paddingBottom: '0.2em',
                display: 'inline-block',
                verticalAlign: 'baseline',
                position: 'relative',
                overflow: 'visible'
              }}
            >
              {t('hero.method')}
            </span>
          </h2>

          <p className="text-xl text-copilot-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('hero.description')}
          </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl"
              >
                {t('hero.getStarted')}
              </button>
              <button className="border-2 border-copilot-border-primary text-copilot-text-primary px-8 py-4 rounded-full text-lg font-semibold hover:border-copilot-border-secondary hover:bg-copilot-bg-hover transition-all duration-200">
                {t('hero.viewDemo')}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-copilot-accent-blue mb-2">12</div>
                <div className="text-copilot-text-secondary">{t('stats.completeLessons')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-copilot-accent-purple mb-2">500+</div>
                <div className="text-copilot-text-secondary">{t('stats.interactiveQuestions')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-copilot-accent-pink mb-2">24/7</div>
                <div className="text-copilot-text-secondary">{t('stats.available')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-copilot-bg-primary">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-copilot-text-primary mb-4">
              {t('whyChoose.title')}
            </h3>
            <p className="text-xl text-copilot-text-secondary max-w-2xl mx-auto">
              {t('whyChoose.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8 rounded-2xl bg-copilot-bg-secondary hover:bg-copilot-bg-tertiary hover:shadow-xl transition-all duration-300 border border-copilot-border-primary">
              <div className="w-16 h-16 bg-copilot-accent-blue rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">🇬🇧</span>
              </div>
            <h4 className="text-xl font-bold text-copilot-text-primary mb-4">{t('features.interactive.title')}</h4>
            <p className="text-copilot-text-secondary">
              {t('features.interactive.description')}
            </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 rounded-2xl bg-copilot-bg-secondary hover:bg-copilot-bg-tertiary hover:shadow-xl transition-all duration-300 border border-copilot-border-primary">
              <div className="w-16 h-16 bg-copilot-accent-purple rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">🧠</span>
              </div>
            <h4 className="text-xl font-bold text-copilot-text-primary mb-4">{t('features.intelligent.title')}</h4>
            <p className="text-copilot-text-secondary">
              {t('features.intelligent.description')}
            </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 rounded-2xl bg-copilot-bg-secondary hover:bg-copilot-bg-tertiary hover:shadow-xl transition-all duration-300 border border-copilot-border-primary">
              <div className="w-16 h-16 bg-copilot-accent-pink rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h4 className="text-xl font-bold text-copilot-text-primary mb-4">{t('features.progress.title')}</h4>
              <p className="text-copilot-text-secondary">
                {t('features.progress.description')}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-8 rounded-2xl bg-copilot-bg-secondary hover:bg-copilot-bg-tertiary hover:shadow-xl transition-all duration-300 border border-copilot-border-primary">
              <div className="w-16 h-16 bg-copilot-accent-green rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h4 className="text-xl font-bold text-copilot-text-primary mb-4">{t('features.fastLearning.title')}</h4>
              <p className="text-copilot-text-secondary">
                {t('features.fastLearning.description')}
              </p>
            </div>

            {/* Feature 5 */}
            <div className="text-center p-8 rounded-2xl bg-copilot-bg-secondary hover:bg-copilot-bg-tertiary hover:shadow-xl transition-all duration-300 border border-copilot-border-primary">
              <div className="w-16 h-16 bg-copilot-accent-yellow rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h4 className="text-xl font-bold text-copilot-text-primary mb-4">{t('features.practice.title')}</h4>
              <p className="text-copilot-text-secondary">
                {t('features.practice.description')}
              </p>
            </div>

            {/* Feature 6 */}
            <div className="text-center p-8 rounded-2xl bg-copilot-bg-secondary hover:bg-copilot-bg-tertiary hover:shadow-xl transition-all duration-300 border border-copilot-border-primary">
              <div className="w-16 h-16 bg-copilot-accent-blue rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">📱</span>
              </div>
              <h4 className="text-xl font-bold text-copilot-text-primary mb-4">{t('features.fullAccess.title')}</h4>
              <p className="text-copilot-text-secondary">
                {t('features.fullAccess.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-copilot-bg-secondary">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-copilot-text-primary mb-4">
              {t('howItWorks.title')}
            </h3>
            <p className="text-xl text-copilot-text-secondary max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h4 className="text-2xl font-bold text-copilot-text-primary mb-4">{t('howItWorks.step1.title')}</h4>
              <p className="text-copilot-text-secondary text-lg">
                {t('howItWorks.step1.description')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h4 className="text-2xl font-bold text-copilot-text-primary mb-4">{t('howItWorks.step2.title')}</h4>
              <p className="text-copilot-text-secondary text-lg">
                {t('howItWorks.step2.description')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h4 className="text-2xl font-bold text-copilot-text-primary mb-4">{t('howItWorks.step3.title')}</h4>
              <p className="text-copilot-text-secondary text-lg">
                {t('howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('cta.title')}
          </h3>
          <p className="text-xl text-white text-opacity-90 mb-8">
            {t('cta.subtitle')}
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-copilot-bg-primary text-copilot-text-primary border-2 border-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-gray-900 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl"
          >
            {t('cta.button')}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-copilot-bg-tertiary text-copilot-text-primary py-12 border-t border-copilot-border-primary">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-8">
            <h4 className="text-2xl font-bold mb-4">ScaleX</h4>
            <p className="text-copilot-text-secondary">
              {t('footer.tagline')}
            </p>
          </div>
          <div className="border-t border-copilot-border-primary pt-8">
            <p className="text-copilot-text-tertiary">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
