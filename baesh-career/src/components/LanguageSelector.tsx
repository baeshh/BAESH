import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface LanguageSelectorProps {
  onLanguageSelected?: (lang: string) => void;
  showTitle?: boolean;
}

export default function LanguageSelector({ onLanguageSelected, showTitle = true }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language);

  const changeLanguage = (lang: 'ko' | 'en') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('baesh-language', lang);
    setSelectedLang(lang);
    onLanguageSelected?.(lang);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 16,
      padding: showTitle ? 24 : 0
    }}>
      {showTitle && (
        <>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, textAlign: 'center' }}>
            {t('login.selectLanguage')}
          </h2>
          <p style={{ 
            margin: 0, 
            fontSize: 14, 
            color: 'var(--muted)', 
            textAlign: 'center' 
          }}>
            {t('login.selectLanguageDesc')}
          </p>
        </>
      )}
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: 12,
        marginTop: showTitle ? 8 : 0
      }}>
        <button
          onClick={() => changeLanguage('ko')}
          style={{
            padding: '20px 24px',
            borderRadius: 12,
            border: selectedLang === 'ko' 
              ? '2px solid var(--brand)' 
              : '2px solid var(--border)',
            background: selectedLang === 'ko'
              ? 'rgba(30,111,255,0.1)'
              : 'var(--panel)',
            color: selectedLang === 'ko' ? 'var(--brand)' : 'var(--text)',
            fontSize: 18,
            fontWeight: selectedLang === 'ko' ? 600 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8
          }}
          onMouseEnter={(e) => {
            if (selectedLang !== 'ko') {
              e.currentTarget.style.borderColor = 'var(--brand)';
              e.currentTarget.style.background = 'rgba(30,111,255,0.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedLang !== 'ko') {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--panel)';
            }
          }}
        >
          <span style={{ fontSize: 32 }}>🇰🇷</span>
          <span>{t('common.korean')}</span>
        </button>

        <button
          onClick={() => changeLanguage('en')}
          style={{
            padding: '20px 24px',
            borderRadius: 12,
            border: selectedLang === 'en' 
              ? '2px solid var(--brand)' 
              : '2px solid var(--border)',
            background: selectedLang === 'en'
              ? 'rgba(30,111,255,0.1)'
              : 'var(--panel)',
            color: selectedLang === 'en' ? 'var(--brand)' : 'var(--text)',
            fontSize: 18,
            fontWeight: selectedLang === 'en' ? 600 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8
          }}
          onMouseEnter={(e) => {
            if (selectedLang !== 'en') {
              e.currentTarget.style.borderColor = 'var(--brand)';
              e.currentTarget.style.background = 'rgba(30,111,255,0.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedLang !== 'en') {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--panel)';
            }
          }}
        >
          <span style={{ fontSize: 32 }}>🇺🇸</span>
          <span>{t('common.english')}</span>
        </button>
      </div>
    </div>
  );
}
