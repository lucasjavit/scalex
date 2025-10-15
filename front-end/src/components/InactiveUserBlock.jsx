import { useNavigate } from 'react-router-dom';

export default function InactiveUserBlock() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // This will trigger the logout in the auth context
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-copilot-bg-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot-lg p-8 text-center shadow-copilot-xl">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl">🚫</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-copilot-text-primary mb-4">
          Inactive Account
        </h1>

        {/* Message */}
        <p className="text-copilot-text-secondary mb-6 leading-relaxed">
          Your account has been deactivated by an administrator. Please contact support
          to reactivate your account and continue using ScaleX.
        </p>

        {/* Contact Info */}
        <div className="bg-copilot-bg-tertiary border border-copilot-border-default rounded-copilot p-4 mb-6">
          <h3 className="font-semibold text-copilot-text-primary mb-2">
            Need help?
          </h3>
          <p className="text-sm text-copilot-text-secondary">
            Contact us: <span className="font-medium text-copilot-accent-primary">support@scalex.com</span>
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full bg-copilot-accent-primary text-white px-6 py-3 rounded-copilot font-semibold hover:bg-copilot-accent-primary/90 transition-colors duration-200"
          >
            Logout
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-copilot-bg-tertiary text-copilot-text-primary px-6 py-3 rounded-copilot font-semibold hover:bg-copilot-bg-primary transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
