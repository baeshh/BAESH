import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from './Modal'
import { apiGet, apiPost, apiDelete } from '../utils/api'
import { useAuth } from '../auth/AuthContext'

export default function UserProfileModal({ open, onClose, user, onDM }: { open: boolean; onClose: () => void; user: { id?: string; name?: string } | null; onDM?: () => void }) {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [followCounts, setFollowCounts] = useState({ followersCount: 0, followingCount: 0, isFollowing: false })
  const [loading, setLoading] = useState(false)
  const [loadingFollow, setLoadingFollow] = useState(false)
  
  const userId = user?.id
  const userName = user?.name || '사용자'
  const isCurrentUser = userId && currentUser?.id && String(userId) === String(currentUser.id)

  // 사용자 프로필 정보 및 팔로우 상태 가져오기
  useEffect(() => {
    if (open && userId) {
      setLoading(true)
      Promise.all([
        apiGet(`/users/${userId}/profile`),
        apiGet<{ followersCount: number, followingCount: number, isFollowing: boolean }>(`/users/${userId}/follow-counts`)
      ])
        .then(([profile, counts]) => {
          setUserProfile(profile)
          setFollowCounts(counts)
          
          // 다른 사용자의 프로필 사진을 백엔드에서 가져와서 localStorage에 저장
          // (현재 사용자가 아닌 경우에만)
          if (!isCurrentUser && userId) {
            const profileData = profile as any
            if (profileData.profilePhoto) {
              localStorage.setItem(`baesh-profile-photo-${userId}`, profileData.profilePhoto)
            }
            if (profileData.coverImage) {
              localStorage.setItem(`baesh-cover-image-${userId}`, profileData.coverImage)
            }
            if (profileData.headline) {
              localStorage.setItem(`baesh-headline-${userId}`, profileData.headline)
            }
            if (profileData.username) {
              localStorage.setItem(`baesh-username-${userId}`, profileData.username)
            }
          }
        })
        .catch((error) => {
          console.error('Failed to load user profile:', error)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [open, userId])

  // 프로필 사진 가져오기 (사용자별로 분리)
  const profilePhoto = isCurrentUser 
    ? localStorage.getItem(`baesh-profile-photo-${currentUser?.id}`)
    : (userId ? localStorage.getItem(`baesh-profile-photo-${userId}`) : null)
  
  // AI 태그 (interests에서 가져오기)
  const aiTags = userProfile?.interests || []
  
  // 한 줄 소개
  const headline = userProfile?.goals || ''
  
  // 학교/전공 정보
  const school = userProfile?.basic?.school || ''
  const major = userProfile?.basic?.major || ''
  const status = userProfile?.basic?.status || []
  
  // 사용자명
  const username = userProfile?.basic?.nickname || ''

  const handleFollow = async () => {
    if (!userId) return
    setLoadingFollow(true)
    try {
      if (followCounts.isFollowing) {
        await apiDelete(`/users/${userId}/follow`)
        setFollowCounts(prev => ({ ...prev, isFollowing: false, followersCount: Math.max(0, prev.followersCount - 1) }))
      } else {
        await apiPost(`/users/${userId}/follow`, {})
        setFollowCounts(prev => ({ ...prev, isFollowing: true, followersCount: prev.followersCount + 1 }))
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error)
      alert('팔로우 처리에 실패했습니다.')
    } finally {
      setLoadingFollow(false)
    }
  }

  const handleViewFullProfile = () => {
    if (userId) {
      onClose()
      navigate(`/profile/${userId}`)
    }
  }
  
  const handleDM = () => {
    onClose()
    onDM?.()
  }

  return (
    <Modal open={open} onClose={onClose} title={undefined} style={{ maxWidth: 360, padding: 0 }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <div className="helper" style={{ fontSize: 14 }}>프로필을 불러오는 중...</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 0, position: 'relative' }}>
          {/* 커버 이미지 */}
          <div 
            style={{ 
              width: '100%', 
              height: 80, 
              background: 'linear-gradient(135deg, #1E6FFF 0%, #408CFF 50%, #6366F1 100%)',
              position: 'relative',
              borderRadius: '12px 12px 0 0'
            }}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--brand)',
                border: 'none',
                color: 'white',
                fontSize: 18,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)'
                e.currentTarget.style.background = '#0d5ae6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.background = 'var(--brand)'
              }}
            >
              ×
            </button>
          </div>

          {/* 프로필 정보 영역 */}
          <div style={{ padding: '16px', position: 'relative' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              {/* 프로필 사진 */}
              <div style={{ marginTop: -40 }}>
                <div 
                  style={{ 
                    position: 'relative',
                    width: 70, 
                    height: 70, 
                    borderRadius: '50%', 
                    overflow: 'hidden',
                    border: '3px solid #fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    background: profilePhoto ? 'transparent' : 'linear-gradient(135deg, #1E6FFF, #408CFF)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {profilePhoto ? (
                    <img 
                      src={profilePhoto} 
                      alt={userName}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 32, color: 'white' }}>👤</span>
                  )}
                </div>
              </div>

              {/* 프로필 정보 */}
              <div style={{ flex: 1, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                    {userName}
                  </h2>
                  <span style={{ fontSize: 14 }}>🇰🇷</span>
                  {username && (
                    <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
                      @{username}
                    </span>
                  )}
                </div>
                
                {/* 한 줄 소개 */}
                {headline && (
                  <p style={{ 
                    margin: '0 0 6px 0', 
                    fontSize: 12, 
                    color: 'var(--text)',
                    lineHeight: 1.4
                  }}>
                    {headline}
                  </p>
                )}

                {/* 학교/전공 정보 */}
                {(school || major) && (
                  <div style={{ marginBottom: 6, fontSize: 11, color: 'var(--muted)' }}>
                    {school && major ? `${school} · ${major}` : school || major}
                    {status.length > 0 && (
                      <span> · {status[0]}</span>
                    )}
                  </div>
                )}

                {/* AI 태그 */}
                {aiTags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                    {aiTags.slice(0, 3).map((tag: string, i: number) => (
                      <span 
                        key={i} 
                        className="chip"
                        style={{ 
                          background: 'rgba(30, 111, 255, 0.1)',
                          color: 'var(--brand)',
                          border: '1px solid rgba(30, 111, 255, 0.2)',
                          fontSize: 10,
                          padding: '3px 8px'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 팔로워/팔로잉 수 */}
                <div style={{ display: 'flex', gap: 12, fontSize: 12, marginBottom: 12 }}>
                  <span style={{ cursor: 'pointer', color: 'var(--text)' }}>
                    <strong>{followCounts.followersCount}</strong> 팔로워
                  </span>
                  <span style={{ cursor: 'pointer', color: 'var(--text)' }}>
                    <strong>{followCounts.followingCount}</strong> 팔로잉
                  </span>
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            {!isCurrentUser && (
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                <button
                  className="button"
                  onClick={handleFollow}
                  disabled={loadingFollow}
                  style={{ 
                    flex: 1, 
                    height: 36,
                    fontSize: 13,
                    fontWeight: 600,
                    background: followCounts.isFollowing 
                      ? 'rgba(30,111,255,0.1)' 
                      : undefined,
                    color: followCounts.isFollowing 
                      ? 'var(--brand)' 
                      : undefined,
                    borderColor: followCounts.isFollowing 
                      ? 'var(--brand)' 
                      : undefined
                  }}
                >
                  {followCounts.isFollowing ? '✓ 팔로잉' : '팔로우'}
                </button>
                <button 
                  className="button" 
                  onClick={handleDM}
                  style={{ 
                    flex: 1, 
                    height: 36,
                    fontSize: 13,
                    fontWeight: 600
                  }}
                >
                  메시지
                </button>
              </div>
            )}

            {/* 전체 프로필 보기 버튼 */}
            <button
              className="button"
              onClick={handleViewFullProfile}
              style={{
                width: '100%',
                height: 36,
                fontSize: 13,
                fontWeight: 600,
                marginTop: isCurrentUser ? 0 : 6,
                background: 'linear-gradient(135deg, var(--brand), var(--accent))',
                boxShadow: '0 2px 8px rgba(30, 111, 255, 0.2)',
              }}
            >
              전체 프로필 보기 →
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

