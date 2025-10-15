import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const { t } = useTranslation('landing');
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40">
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
                ScaleX
              </h1>
            <p className="text-xl text-gray-600 font-medium">
              {t('hero.tagline')}
            </p>
          </div>

          {/* Main Headline */}
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight" style={{ overflow: 'visible' }}>
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

          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
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
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
                {t('hero.viewDemo')}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">12</div>
                <div className="text-gray-600">{t('stats.completeLessons')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
                <div className="text-gray-600">{t('stats.interactiveQuestions')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-pink-600 mb-2">24/7</div>
                <div className="text-gray-600">{t('stats.available')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              {t('whyChoose.title')}
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('whyChoose.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">🇬🇧</span>
              </div>
            <h4 className="text-xl font-bold text-gray-900 mb-4">{t('features.interactive.title')}</h4>
            <p className="text-gray-600">
              {t('features.interactive.description')}
            </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">🧠</span>
              </div>
            <h4 className="text-xl font-bold text-gray-900 mb-4">{t('features.intelligent.title')}</h4>
            <p className="text-gray-600">
              {t('features.intelligent.description')}
            </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">{t('features.progress.title')}</h4>
              <p className="text-gray-600">
                {t('features.progress.description')}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">{t('features.fastLearning.title')}</h4>
              <p className="text-gray-600">
                {t('features.fastLearning.description')}
              </p>
            </div>

            {/* Feature 5 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">{t('features.practice.title')}</h4>
              <p className="text-gray-600">
                {t('features.practice.description')}
              </p>
            </div>

            {/* Feature 6 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">📱</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">{t('features.fullAccess.title')}</h4>
              <p className="text-gray-600">
                {t('features.fullAccess.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              {t('howItWorks.title')}
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">{t('howItWorks.step1.title')}</h4>
              <p className="text-gray-600 text-lg">
                {t('howItWorks.step1.description')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">{t('howItWorks.step2.title')}</h4>
              <p className="text-gray-600 text-lg">
                {t('howItWorks.step2.description')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">{t('howItWorks.step3.title')}</h4>
              <p className="text-gray-600 text-lg">
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
            className="bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl"
          >
            {t('cta.button')}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-8">
            <h4 className="text-2xl font-bold mb-4">ScaleX</h4>
            <p className="text-gray-400">
              {t('footer.tagline')}
            </p>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
