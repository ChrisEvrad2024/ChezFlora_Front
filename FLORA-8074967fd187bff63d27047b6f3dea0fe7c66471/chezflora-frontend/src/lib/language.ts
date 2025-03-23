
type Language = {
  code: string;
  name: string;
  flag: string;
};

export const availableLanguages: Language[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export const getDefaultLanguage = (): Language => {
  const savedLanguage = localStorage.getItem('language');
  
  if (savedLanguage) {
    const parsed = JSON.parse(savedLanguage);
    return parsed;
  }
  
  // Default to French
  return availableLanguages[0];
};

export const setLanguage = (language: Language): void => {
  localStorage.setItem('language', JSON.stringify(language));
  // Dispatch a custom event for components to listen to
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: language }));
};
