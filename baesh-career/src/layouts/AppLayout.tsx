import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Nav } from '../router'
import Brand from '../components/Brand'
import { useAuth } from '../auth/AuthContext'
import { getNotifications } from '../utils/api'
import Modal from '../components/Modal'
import logoSrc from '../assets/BAESH logo.png'

export default function AppLayout() {
  const { logout } = useAuth()
  const { t } = useTranslation()
  const nav = useNavigate()
  const location = useLocation()
  const isNotificationsPage = location.pathname === '/notifications'
  const [unreadCount, setUnreadCount] = useState(0)
  const [languageModalOpen, setLanguageModalOpen] = useState(false)
  const { i18n } = useTranslation()
  const currentLanguage = i18n.language
  const isEnglish = i18n.language === 'en'

  // 읽지 않은 알림 개수 가져오기
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const data = await getNotifications();
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error('Failed to load notification count:', error);
      }
    };

    loadUnreadCount();
    // 30초마다 새로고침
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]); // 알림 페이지에서 돌아올 때도 업데이트
  
  const { user } = useAuth()
  const userInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateRows: 'auto 1fr', background: '#F8FAFC' }}>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E2E8F0',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {/* 로고 */}
            <a 
              href="/profile" 
              onClick={(e) => {
                e.preventDefault()
                navigate('/profile')
              }}
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
            >
              <img
                src={logoSrc}
                alt="BAESH 로고"
                style={{
                  height: '32px',
                  width: 'auto',
                  display: 'block'
                }}
              />
            </a>
            
            {/* 네비게이션 */}
            <nav style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
              <NavLink
                to="/clone"
                style={({ isActive }) => ({
                  color: isActive ? '#2563EB' : '#64748B',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  padding: '0.5rem 0'
                })}
                onMouseEnter={(e) => {
                  if (!location.pathname.startsWith('/clone') && !location.pathname.startsWith('/hub')) {
                    e.currentTarget.style.color = '#0F172A';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!location.pathname.startsWith('/clone') && !location.pathname.startsWith('/hub')) {
                    e.currentTarget.style.color = '#64748B';
                  }
                }}
              >
                {isEnglish ? 'AI Copilot' : 'AI Copilot'}
              </NavLink>
              <NavLink
                to="/profile"
                style={({ isActive }) => ({
                  color: isActive ? '#2563EB' : '#64748B',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  padding: '0.5rem 0'
                })}
                onMouseEnter={(e) => {
                  if (!location.pathname.startsWith('/profile')) {
                    e.currentTarget.style.color = '#0F172A';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!location.pathname.startsWith('/profile')) {
                    e.currentTarget.style.color = '#64748B';
                  }
                }}
              >
                Profile
              </NavLink>
              <NavLink
                to="/networking"
                style={({ isActive }) => ({
                  color: isActive ? '#2563EB' : '#64748B',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  padding: '0.5rem 0'
                })}
                onMouseEnter={(e) => {
                  if (!location.pathname.startsWith('/networking')) {
                    e.currentTarget.style.color = '#0F172A';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!location.pathname.startsWith('/networking')) {
                    e.currentTarget.style.color = '#64748B';
                  }
                }}
              >
                Network
              </NavLink>
              <NavLink
                to="/projects"
                style={({ isActive }) => ({
                  color: isActive ? '#2563EB' : '#64748B',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  padding: '0.5rem 0'
                })}
                onMouseEnter={(e) => {
                  if (!location.pathname.startsWith('/projects')) {
                    e.currentTarget.style.color = '#0F172A';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!location.pathname.startsWith('/projects')) {
                    e.currentTarget.style.color = '#64748B';
                  }
                }}
              >
                Projects
              </NavLink>
              <NavLink
                to="/lounge"
                style={({ isActive }) => ({
                  color: isActive ? '#2563EB' : '#64748B',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  padding: '0.5rem 0'
                })}
                onMouseEnter={(e) => {
                  if (!location.pathname.startsWith('/lounge')) {
                    e.currentTarget.style.color = '#0F172A';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!location.pathname.startsWith('/lounge')) {
                    e.currentTarget.style.color = '#64748B';
                  }
                }}
              >
                Jobs
              </NavLink>
            </nav>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* 검색 바 */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search skills, people..."
                style={{
                  paddingLeft: '2.25rem',
                  paddingRight: '1rem',
                  paddingTop: '0.375rem',
                  paddingBottom: '0.375rem',
                  borderRadius: '9999px',
                  background: '#F1F5F9',
                  border: 'none',
                  fontSize: '0.875rem',
                  width: '256px',
                  transition: 'all 0.2s',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = 'white'
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = '#F1F5F9'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <i className="fa-solid fa-search" style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8',
                fontSize: '0.75rem'
              }}></i>
            </div>
            
            {/* 알림 버튼 */}
            <button
              onClick={() => nav('/notifications')}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0.5rem',
                transition: 'all 0.2s ease',
                position: 'relative',
                color: '#64748B'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F1F5F9';
                e.currentTarget.style.color = '#0F172A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#64748B';
              }}
            >
              <i className="fa-regular fa-bell" style={{ fontSize: '1.125rem' }}></i>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 4px',
                  background: '#EF4444',
                  borderRadius: '9px',
                  border: '2px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#fff',
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            
            {/* 로그인/로그아웃 버튼 */}
            {user ? (
              <button
                onClick={async () => {
                  if (confirm(isEnglish ? 'Are you sure you want to logout?' : '로그아웃하시겠습니까?')) {
                    await logout()
                    nav('/login')
                  }
                }}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#64748B',
                  background: 'transparent',
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F1F5F9'
                  e.currentTarget.style.color = '#0F172A'
                  e.currentTarget.style.borderColor = '#CBD5E1'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#64748B'
                  e.currentTarget.style.borderColor = '#E2E8F0'
                }}
              >
                <i className="fa-solid fa-right-from-bracket"></i>
                {isEnglish ? 'Logout' : '로그아웃'}
              </button>
            ) : (
              <button
                onClick={() => nav('/login')}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'white',
                  background: 'linear-gradient(135deg, #2563EB 0%, #9333EA 100%)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <i className="fa-solid fa-right-to-bracket"></i>
                {isEnglish ? 'Login' : '로그인'}
              </button>
            )}
            
            {/* 프로필 아바타 */}
            {user && (
              <div
                onClick={() => nav('/profile')}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#E2E8F0',
                  border: 'none',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {user?.id && localStorage.getItem(`baesh-profile-photo-${user.id}`) ? (
                  <img 
                    src={localStorage.getItem(`baesh-profile-photo-${user.id}`)!}
                    alt="User"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
                    alt="User"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* 언어 변경 모달 */}
        <Modal
          open={languageModalOpen}
          onClose={() => setLanguageModalOpen(false)}
          title={t('common.language')}
        >
          <div style={{ display: 'grid', gap: 12, padding: '8px 0' }}>
            <button
              onClick={() => {
                i18n.changeLanguage('ko');
                localStorage.setItem('baesh-language', 'ko');
                setLanguageModalOpen(false);
              }}
              style={{
                padding: '16px 20px',
                borderRadius: 8,
                border: currentLanguage === 'ko' 
                  ? '2px solid var(--brand)' 
                  : '1px solid var(--border)',
                background: currentLanguage === 'ko'
                  ? 'rgba(30, 111, 255, 0.1)'
                  : 'transparent',
                color: currentLanguage === 'ko' ? 'var(--brand)' : 'var(--text)',
                fontSize: 16,
                fontWeight: currentLanguage === 'ko' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <span style={{ fontSize: 24 }}>🇰🇷</span>
              <span>{t('common.korean')}</span>
              {currentLanguage === 'ko' && (
                <span style={{ marginLeft: 'auto', color: 'var(--brand)' }}>✓</span>
              )}
            </button>
            
            <button
              onClick={() => {
                i18n.changeLanguage('en');
                localStorage.setItem('baesh-language', 'en');
                setLanguageModalOpen(false);
              }}
              style={{
                padding: '16px 20px',
                borderRadius: 8,
                border: currentLanguage === 'en' 
                  ? '2px solid var(--brand)' 
                  : '1px solid var(--border)',
                background: currentLanguage === 'en'
                  ? 'rgba(30, 111, 255, 0.1)'
                  : 'transparent',
                color: currentLanguage === 'en' ? 'var(--brand)' : 'var(--text)',
                fontSize: 16,
                fontWeight: currentLanguage === 'en' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <span style={{ fontSize: 24 }}>🇺🇸</span>
              <span>{t('common.english')}</span>
              {currentLanguage === 'en' && (
                <span style={{ marginLeft: 'auto', color: 'var(--brand)' }}>✓</span>
              )}
            </button>
          </div>
        </Modal>
      </header>

      <main className="container" style={{ width: '100%', display: 'block' }}>
        <Outlet />
      </main>
    </div>
  )
}


