import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'EN', flag: '🇺🇸' },
    { code: 'pt-BR', name: 'BR', flag: '🇧🇷' },
    { code: 'es', name: 'ES', flag: '🇪🇸' },
  ];

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-copilot-text-primary hover:bg-copilot-bg-tertiary transition-colors duration-200">
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-xs">▼</span>
      </button>
      
      <div className="absolute right-0 mt-2 w-40 bg-copilot-bg-secondary border border-copilot-border-default rounded-lg shadow-copilot-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-copilot-bg-tertiary transition-colors first:rounded-t-lg last:rounded-b-lg ${
              i18n.language === language.code
                ? 'bg-copilot-accent-primary/10 text-copilot-accent-primary font-semibold'
                : 'text-copilot-text-primary'
            }`}
          >
            <span className="text-lg">{language.flag}</span>
            {i18n.language === language.code && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

