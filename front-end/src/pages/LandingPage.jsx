import { useNavigate } from "react-router-dom";

export default function LandingPage() {
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
              Learn English the smart way
            </p>
          </div>

          {/* Main Headline */}
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight" style={{ overflow: 'visible' }}>
            Master English with
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
              interactive method + spaced repetition
            </span>
          </h2>

          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Combine the efficiency of interactive method with the power of intelligent spaced repetition system.
            Learn English naturally, quickly and lastingly.
          </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl"
              >
                Get Started
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
                View Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">12</div>
                <div className="text-gray-600">Complete Lessons</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
                <div className="text-gray-600">Interactive Questions</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-pink-600 mb-2">24/7</div>
                <div className="text-gray-600">Available</div>
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
              Why choose ScaleX?
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines the best learning techniques to maximize your results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">🇬🇧</span>
              </div>
            <h4 className="text-xl font-bold text-gray-900 mb-4">Interactive Method</h4>
            <p className="text-gray-600">
              Learn American and British English through quick questions and answers, developing natural fluency
            </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">🧠</span>
              </div>
            <h4 className="text-xl font-bold text-gray-900 mb-4">Intelligent System</h4>
            <p className="text-gray-600">
              Smart spaced repetition that ensures you never forget what you've learned
            </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Smart Progress</h4>
              <p className="text-gray-600">
                Track your development with detailed metrics and personalized reports
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Fast Learning</h4>
              <p className="text-gray-600">
                Master English in record time with our proven and efficient methodology
              </p>
            </div>

            {/* Feature 5 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Practice Focused</h4>
              <p className="text-gray-600">
                Practical exercises that simulate real English conversation situations
              </p>
            </div>

            {/* Feature 6 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">📱</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Full Access</h4>
              <p className="text-gray-600">
                Study anywhere, anytime with our responsive platform
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
              How does it work?
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to master English
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Level</h4>
              <p className="text-gray-600 text-lg">
                Select between Beginner, Intermediate or Advanced to start at your ideal level
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Practice Intelligently</h4>
              <p className="text-gray-600 text-lg">
                Answer questions and mark difficulty. The system automatically adjusts review
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Review and Master</h4>
              <p className="text-gray-600 text-lg">
                The system schedules smart reviews to ensure you never forget
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to start your journey?
          </h3>
          <p className="text-xl text-white text-opacity-90 mb-8">
            Join thousands of students who have already mastered English with ScaleX
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-8">
            <h4 className="text-2xl font-bold mb-4">ScaleX</h4>
            <p className="text-gray-400">
              Learn English the smart way with interactive method + spaced repetition
            </p>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400">
              © 2024 ScaleX. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
