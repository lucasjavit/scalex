import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ to = null, onClick = null, label = null, className = '' }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  // Don't add mb-6 if it's used inline or with onClick
  const wrapperClassName = (className || onClick ? '' : 'mb-6');
  
  return (
    <div className={wrapperClassName}>
      <button
        onClick={handleClick}
        className={`group ${className || 'inline-flex items-center gap-2'} px-5 py-3 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-800 dark:text-slate-100 shadow-lg border border-slate-300 dark:border-slate-600 hover:shadow-xl hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-700 active:shadow-inner active:translate-y-0.5 transition-all duration-200`}
      >
        {!className && (
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        )}
        <span className="font-semibold">{label || t('common:navigation.back', 'Voltar')}</span>
        {className && <span className="ml-2">→</span>}
      </button>
    </div>
  );
};

export default BackButton;

