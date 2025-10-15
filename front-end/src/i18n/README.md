# Internationalization (i18n) Guide

## 📚 Overview

This project uses **react-i18next** for internationalization. Users can switch between English, Portuguese (Brazil), and Spanish seamlessly.

## 🗂️ File Structure

```
src/i18n/
├── index.js                 # i18n configuration
├── locales/
│   ├── en/                 # English translations
│   │   ├── common.json     # Common translations (navbar, footer, buttons)
│   │   ├── auth.json       # Authentication & profile
│   │   ├── admin.json      # Admin panel
│   │   ├── videoCall.json  # Video call feature
│   │   └── landing.json    # Landing page
│   ├── pt-BR/              # Portuguese translations
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── admin.json
│   │   ├── videoCall.json
│   │   └── landing.json
│   └── es/                 # Spanish translations
│       ├── common.json
│       ├── auth.json
│       ├── admin.json
│       ├── videoCall.json
│       └── landing.json
└── README.md              # This file
```

## 🚀 Usage

### Basic Usage

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('common'); // Specify namespace
  
  return (
    <div>
      <h1>{t('app.name')}</h1>
      <button>{t('buttons.save')}</button>
    </div>
  );
}
```

### Using Multiple Namespaces

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation(['common', 'auth']);
  
  return (
    <div>
      <h1>{t('common:app.name')}</h1>
      <p>{t('auth:login.title')}</p>
    </div>
  );
}
```

### With Interpolation

```jsx
// Translation file
{
  "welcome": "Welcome, {{name}}!"
}

// Component
const { t } = useTranslation();
return <h1>{t('welcome', { name: user.name })}</h1>;
```

### Changing Language

```jsx
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  return (
    <button onClick={() => i18n.changeLanguage('pt-BR')}>
      Switch to Portuguese
    </button>
  );
}
```

## 📝 Namespaces

### `common`
- App-wide elements (navbar, footer, buttons)
- Common messages and errors
- General UI elements

### `auth`
- Login/Logout
- User profile
- Address management
- Inactive account messages

### `admin`
- Admin dashboard
- Lessons management
- Questions management
- Users management
- Video call admin

### `videoCall`
- Video call dashboard
- Room interface
- Queue system
- Tips and messages

### `landing`
- Landing page content
- Hero section
- Features
- How it works
- CTA sections

## ✨ Features

### 1. Automatic Language Detection
The system automatically detects the user's browser language on first visit.

### 2. Language Persistence
User's language preference is saved in `localStorage` and persists across sessions.

### 3. Fallback Language
If a translation is missing, the system falls back to English.

### 4. LanguageSelector Component
A ready-to-use component (`src/components/LanguageSelector.jsx`) for language switching in the navbar.

## 🔧 Adding New Translations

### 1. Add to JSON files

**en/common.json:**
```json
{
  "myFeature": {
    "title": "My Feature",
    "description": "This is my feature"
  }
}
```

**pt-BR/common.json:**
```json
{
  "myFeature": {
    "title": "Minha Funcionalidade",
    "description": "Esta é minha funcionalidade"
  }
}
```

### 2. Use in component

```jsx
const { t } = useTranslation('common');
return <h1>{t('myFeature.title')}</h1>;
```

## 📦 Adding New Languages

1. Create new folder in `locales/` (e.g., `es` for Spanish)
2. Copy all JSON files from `en/` to the new folder
3. Translate all strings
4. Update `src/i18n/index.js`:

```js
import esCommon from './locales/es/common.json';
// ... import other namespaces

const resources = {
  en: { /* ... */ },
  'pt-BR': { /* ... */ },
  es: {
    common: esCommon,
    // ... other namespaces
  },
};
```

5. Update `LanguageSelector.jsx` to include the new language

## 🎯 Best Practices

1. **Always use keys**: Never hardcode strings in components
2. **Organize by feature**: Keep related translations together
3. **Use meaningful keys**: `auth.login.title` instead of `text1`
4. **Keep hierarchy shallow**: Max 3 levels deep
5. **Use interpolation**: For dynamic content like names, dates
6. **Test both languages**: Always check translations display correctly

## 🐛 Troubleshooting

### Translation not showing?
1. Check if the key exists in the JSON file
2. Verify you're using the correct namespace
3. Check browser console for i18n errors
4. Clear localStorage and refresh

### Language not persisting?
- Check localStorage for `i18nextLng` key
- Verify browser allows localStorage

### New translations not appearing?
- Restart dev server after adding new JSON files
- Clear browser cache

## 📖 Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)

---

**Last Updated**: 2024
**Maintainer**: ScaleX Team

