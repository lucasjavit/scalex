import { useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();

  // Don't render footer on landing/login pages
  if (location.pathname === '/' || location.pathname === '/login') {
    return null;
  }

  return (
    <footer className="bg-copilot-bg-secondary border-t border-copilot-border-default mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="text-center">
          {/* Brand */}
          <div className="mb-1">
            <span className="bg-copilot-gradient bg-clip-text text-transparent font-bold text-base">
              ScaleX
            </span>
          </div>
          
          {/* Copyright */}
          <div className="text-copilot-text-secondary text-xs mb-1">
            © {new Date().getFullYear()} ScaleX. All rights reserved.
          </div>

          {/* Legal Links */}
          <div className="flex justify-center space-x-3">
            <a
              href="#"
              className="text-copilot-text-secondary hover:text-copilot-accent-primary transition-colors duration-200 text-xs"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-copilot-text-secondary hover:text-copilot-accent-primary transition-colors duration-200 text-xs"
            >
              Terms of Use
            </a>
            <a 
              href="#" 
              className="text-copilot-text-secondary hover:text-copilot-accent-primary transition-colors duration-200 text-xs"
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
