import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from './locales/ko.json';
import en from './locales/en.json';

// localStorage에서 저장된 언어 가져오기
const getStoredLanguage = (): string => {
  const stored = localStorage.getItem('baesh-language');
  if (stored === 'ko' || stored === 'en') {
    return stored;
  }
  // 브라우저 언어 감지
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'ko' ? 'ko' : 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en },
    },
    lng: getStoredLanguage(),
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
