import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, type Notification } from '../utils/api';

// 시간 포맷팅 함수
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

// 알림 타입별 아이콘
function getNotificationIcon(type: string): string {
  switch (type) {
    case 'lounge':
      return '🎯';
    case 'networking':
      return '👥';
    case 'job':
      return '💼';
    case 'system':
      return '🔔';
    default:
      return '📢';
  }
}

// 알림 타입별 색상
function getNotificationColor(type: string): string {
  switch (type) {
    case 'lounge':
      return '#1E6FFF';
    case 'networking':
      return '#10B981';
    case 'job':
      return '#F59E0B';
    case 'system':
      return '#6B7280';
    default:
      return '#64748B';
  }
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 알림 로드
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // 30초마다 새로고침
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // 알림 클릭 처리
  const handleNotificationClick = async (notification: Notification) => {
    // 읽지 않은 알림이면 읽음 처리
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // 링크가 있으면 이동
    if (notification.link) {
      navigate(notification.link);
    }
  };

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // 알림 필터링 (타입별)
  const [filter, setFilter] = useState<string>('all');
  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 0' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>알림</h1>
        {unreadCount > 0 && (
          <button
            className="button--ghost"
            onClick={handleMarkAllAsRead}
            style={{
              fontSize: 14,
              height: 36,
              padding: '0 16px',
            }}
          >
            모두 읽음 처리
          </button>
        )}
      </div>

      {/* 필터 탭 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
        {[
          { key: 'all', label: '전체' },
          { key: 'lounge', label: '라운지' },
          { key: 'networking', label: '네트워킹' },
          { key: 'job', label: '채용' },
          { key: 'system', label: '시스템' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '8px 16px',
              background: filter === tab.key ? 'var(--brand)' : 'transparent',
              color: filter === tab.key ? '#fff' : 'var(--muted)',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: filter === tab.key ? 600 : 400,
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 알림 목록 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
          <p>알림을 불러오는 중...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>알림이 없습니다</p>
          <p style={{ fontSize: 14 }}>새로운 활동이 있으면 여기에 표시됩니다.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {filteredNotifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              style={{
                display: 'flex',
                gap: 12,
                padding: 16,
                background: notification.read ? 'var(--panel)' : 'rgba(30, 111, 255, 0.04)',
                border: `1px solid ${notification.read ? 'var(--border)' : 'rgba(30, 111, 255, 0.2)'}`,
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = notification.read
                  ? 'rgba(0, 0, 0, 0.02)'
                  : 'rgba(30, 111, 255, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = notification.read
                  ? 'var(--panel)'
                  : 'rgba(30, 111, 255, 0.04)';
              }}
            >
              {/* 읽지 않은 알림 표시 */}
              {!notification.read && (
                <div
                  style={{
                    position: 'absolute',
                    left: 8,
                    top: 8,
                    width: 8,
                    height: 8,
                    background: 'var(--brand)',
                    borderRadius: '50%',
                  }}
                />
              )}

              {/* 아이콘 */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: `${getNotificationColor(notification.type)}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  flexShrink: 0,
                }}
              >
                {getNotificationIcon(notification.type)}
              </div>

              {/* 내용 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: 15,
                        fontWeight: notification.read ? 500 : 600,
                        color: 'var(--text)',
                      }}
                    >
                      {notification.title}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        color: 'var(--muted)',
                        lineHeight: 1.5,
                      }}
                    >
                      {notification.message}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--muted)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatTime(notification.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
