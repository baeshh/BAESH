import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ProgressRing from '../components/ProgressRing'
import InsightCard from '../components/InsightCard'
import Modal from '../components/Modal'
import ProfileEditModal from '../forms/ProfileEditModal'
import CredentialFormModal from '../forms/CredentialFormModal'
import AwardFormModal from '../forms/AwardFormModal'
import CareerFormModal from '../forms/CareerFormModal'
import PortfolioFormModal from '../forms/PortfolioFormModal'
import OrganizationFormModal from '../forms/OrganizationFormModal'
import VerificationModal from '../forms/VerificationModal'
import PostCard from '../components/PostCard'
import { getUserProfile, type UserProfile } from '../services/userProfileService'
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api'
import { useAuth } from '../auth/AuthContext'
import FollowListModal from '../components/FollowListModal'

type Tab = '자격/수료' | '포트폴리오' | '게시물' | '단체/활동' | '수상/성과' | '경력'

export default function Profile() {
  const { t, i18n } = useTranslation()
  const isEnglish = i18n.language === 'en'
  const { userId } = useParams<{ userId?: string }>()
  const navigate = useNavigate()
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)
  
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const { user: currentUser } = useAuth()
  const isViewingOtherProfile = !!userId && userId !== currentUser?.id
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [myPosts, setMyPosts] = useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [editPost, setEditPost] = useState<any | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editTags, setEditTags] = useState<string[]>([])
  const [followCounts, setFollowCounts] = useState({ followersCount: 0, followingCount: 0, isFollowing: false })
  const [loadingFollow, setLoadingFollow] = useState(false)
  const [followListOpen, setFollowListOpen] = useState(false)
  const [followListType, setFollowListType] = useState<'followers' | 'following'>('followers')
  const [projects, setProjects] = useState<any[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  
  const loadMyPosts = useCallback(async () => {
    if (!currentUser?.id) return
    try {
      setLoadingPosts(true)
      const data = await apiGet<{ posts: any[] }>('/posts?type=networking')
      // 현재 사용자가 작성한 게시물만 필터링
      const myPostsData = data.posts.filter((p: any) => p.authorId === currentUser.id)
      setMyPosts(myPostsData)
    } catch (error) {
      console.error('Failed to load my posts:', error)
    } finally {
      setLoadingPosts(false)
    }
  }, [currentUser?.id])

  const loadProjects = useCallback(async () => {
    if (!currentUser?.id || isViewingOtherProfile) return
    try {
      setLoadingProjects(true)
      const data = await apiGet<{ projects: any[] }>('/projects')
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Failed to load projects:', error)
      setProjects([])
    } finally {
      setLoadingProjects(false)
    }
  }, [currentUser?.id, isViewingOtherProfile])
  
  useEffect(() => {
    const loadProfile = async () => {
      try {
        let profile: UserProfile
        if (isViewingOtherProfile && userId) {
          // 다른 사용자 프로필 가져오기
          profile = await apiGet<UserProfile & { profilePhoto?: string; coverImage?: string; headline?: string; username?: string }>(`/users/${userId}/profile`)
          console.log('다른 사용자 프로필 데이터:', profile)
          console.log('프로필 사진:', profile.profilePhoto)
          // 다른 사용자의 프로필 사진은 백엔드에서 가져오기
          if (profile.profilePhoto) {
            console.log('프로필 사진 설정:', profile.profilePhoto.substring(0, 50) + '...')
            setProfilePhoto(profile.profilePhoto)
            // localStorage에도 저장 (다음에 빠르게 로드하기 위해)
            localStorage.setItem(`baesh-profile-photo-${userId}`, profile.profilePhoto)
          } else {
            console.log('프로필 사진이 없음, localStorage 확인')
            // localStorage에서 확인 (이전에 본 적이 있을 수 있음)
            const cachedPhoto = localStorage.getItem(`baesh-profile-photo-${userId}`)
            if (cachedPhoto) {
              console.log('localStorage에서 프로필 사진 발견')
              setProfilePhoto(cachedPhoto)
            } else {
              setProfilePhoto(null)
            }
          }
          if (profile.coverImage) {
            setCoverImage(profile.coverImage)
            localStorage.setItem(`baesh-cover-image-${userId}`, profile.coverImage)
          } else {
            setCoverImage(null)
          }
          if (profile.headline) {
            setHeadline(profile.headline)
            localStorage.setItem(`baesh-headline-${userId}`, profile.headline)
          } else {
            setHeadline('')
          }
          if (profile.username) {
            setUsername(profile.username)
            localStorage.setItem(`baesh-username-${userId}`, profile.username)
          } else {
            setUsername('')
          }
        } else {
          // 현재 사용자 프로필 가져오기
          profile = await getUserProfile() as UserProfile & { profilePhoto?: string; coverImage?: string; headline?: string; username?: string }
          
          // 백엔드에서 프로필 사진 및 추가 정보 가져오기
          if (profile.profilePhoto) {
            setProfilePhoto(profile.profilePhoto)
            const userId = currentUser?.id || 'default'
            localStorage.setItem(`baesh-profile-photo-${userId}`, profile.profilePhoto)
          } else {
            // localStorage에서 확인 (백엔드에 없을 경우)
            const userId = currentUser?.id || 'default'
            const savedPhoto = localStorage.getItem(`baesh-profile-photo-${userId}`)
            if (savedPhoto) setProfilePhoto(savedPhoto)
            else setProfilePhoto(null)
          }
          
          if (profile.coverImage) {
            setCoverImage(profile.coverImage)
            const userId = currentUser?.id || 'default'
            localStorage.setItem(`baesh-cover-image-${userId}`, profile.coverImage)
          } else {
            const userId = currentUser?.id || 'default'
            const savedCover = localStorage.getItem(`baesh-cover-image-${userId}`)
            if (savedCover) setCoverImage(savedCover)
            else setCoverImage(null)
          }
          
          if (profile.headline) {
            setHeadline(profile.headline)
            const userId = currentUser?.id || 'default'
            localStorage.setItem(`baesh-headline-${userId}`, profile.headline)
          } else {
            const userId = currentUser?.id || 'default'
            const savedHeadline = localStorage.getItem(`baesh-headline-${userId}`)
            if (savedHeadline) setHeadline(savedHeadline)
            else setHeadline('')
          }
          
          if (profile.username) {
            setUsername(profile.username)
            const userId = currentUser?.id || 'default'
            localStorage.setItem(`baesh-username-${userId}`, profile.username)
          } else {
            const userId = currentUser?.id || 'default'
            const savedUsername = localStorage.getItem(`baesh-username-${userId}`)
            if (savedUsername) setUsername(savedUsername)
            else setUsername('')
          }
        }
        setUserProfile(profile)
      } catch (error) {
        console.error('프로필 로드 실패:', error)
        // 에러 발생 시 현재 로그인한 사용자 정보로 빈 프로필 생성
        const userName = currentUser?.name || '사용자'
        setUserProfile({
          basic: { name: userName, status: [] },
          credentials: [],
          awards: [],
          careers: [],
          portfolios: [],
          organizations: [],
          topSkills: [],
          interests: [],
        })
      }
    }
    loadProfile()
    
    // 내 게시물 로드 (현재 사용자만)
    if (!isViewingOtherProfile && currentUser?.id) {
      loadMyPosts()
      loadProjects()
    }
    
    // 사용자 변경 시 프로필 사진 등 다시 로드
    if (!isViewingOtherProfile && currentUser?.id) {
      const userId = currentUser.id
      const savedPhoto = localStorage.getItem(`baesh-profile-photo-${userId}`)
      const savedCover = localStorage.getItem(`baesh-cover-image-${userId}`)
      const savedHeadline = localStorage.getItem(`baesh-headline-${userId}`)
      const savedUsername = localStorage.getItem(`baesh-username-${userId}`)
      if (savedPhoto) setProfilePhoto(savedPhoto)
      else setProfilePhoto(null)
      if (savedCover) setCoverImage(savedCover)
      else setCoverImage(null)
      if (savedHeadline) setHeadline(savedHeadline)
      else setHeadline('')
      if (savedUsername) setUsername(savedUsername)
      else setUsername('')
    }
    
    // 팔로우/팔로잉 수 로드
    const loadFollowCounts = async () => {
      try {
        const targetUserId = userId || currentUser?.id
        if (!targetUserId) return
        
        const data = await apiGet<{ followersCount: number, followingCount: number, isFollowing: boolean }>(
          `/users/${targetUserId}/follow-counts`
        )
        setFollowCounts(data)
      } catch (error) {
        console.error('Failed to load follow counts:', error)
      }
    }
    
    loadFollowCounts()
  }, [userId, isViewingOtherProfile, currentUser?.id, currentUser?.name, loadMyPosts, loadProjects])
  
  const handleEditPost = (postId: string | number) => {
    const post = myPosts.find(p => p.id === postId)
    if (post) {
      setEditPost(post)
      setEditContent(post.content)
      setEditTags(post.tags)
    }
  }

  const handleUpdatePost = async () => {
    if (!editPost) return
    
    try {
      const updatedPost = await apiPut<any>(`/posts/${editPost.id}`, {
        title: '', // 인스타그램 스타일 - 제목 없음
        content: editContent,
        tags: editTags,
      })
      setMyPosts(myPosts.map(p => p.id === editPost.id ? updatedPost : p))
      setEditPost(null)
      setEditContent('')
      setEditTags([])
      addInsight(t('post.postUpdated'))
    } catch (error) {
      console.error('Failed to update post:', error)
      alert(t('post.updateFailed'))
    }
  }

  const handleDeletePost = async (postId: string | number) => {
    try {
      await apiDelete(`/posts/${postId}`)
      setMyPosts(myPosts.filter(p => p.id !== postId))
      addInsight(t('post.postDeleted'))
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert(t('post.deleteFailed'))
    }
  }
  
  const [tab, setTab] = useState<Tab>('자격/수료')
  const [editOpen, setEditOpen] = useState(false)
  const [newInsight, setNewInsight] = useState(false)
  const [profileEditOpen, setProfileEditOpen] = useState(false)
  const [openCred, setOpenCred] = useState(false)
  const [openAward, setOpenAward] = useState(false)
  const [openCareer, setOpenCareer] = useState(false)
  const [openPort, setOpenPort] = useState(false)
  const [openOrg, setOpenOrg] = useState(false)
  const [openVerify, setOpenVerify] = useState(false)
  // 사용자 ID를 키로 사용하여 각 계정별로 분리
  const getStorageKey = (key: string) => {
    const userId = currentUser?.id || 'default'
    return `${key}-${userId}`
  }

  const [profilePhoto, setProfilePhoto] = useState<string | null>(() => {
    // localStorage에서 프로필 사진 로드
    return localStorage.getItem(getStorageKey('baesh-profile-photo'))
  })
  const [coverImage, setCoverImage] = useState<string | null>(() => {
    return localStorage.getItem(getStorageKey('baesh-cover-image'))
  })
  const [headline, setHeadline] = useState<string>(() => {
    return localStorage.getItem(getStorageKey('baesh-headline')) || ''
  })
  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem(getStorageKey('baesh-username')) || ''
  })
  const [photoChangeOpen, setPhotoChangeOpen] = useState(false)

  const addInsight = (title: string) => {
    setNewInsight(true)
    setTimeout(() => setNewInsight(false), 1500)
    console.log('insight:', title)
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const photoData = reader.result as string
        setProfilePhoto(photoData)
        localStorage.setItem(getStorageKey('baesh-profile-photo'), photoData)
        
        // 백엔드에 프로필 사진 저장
        try {
          await apiPut('/users/profile', { profilePhoto: photoData })
          console.log('프로필 사진이 백엔드에 저장되었습니다')
        } catch (error) {
          console.error('프로필 사진 저장 실패:', error)
        }
        
        setPhotoChangeOpen(false)
        addInsight('프로필 사진이 업데이트되었습니다')
        // 프로필 사진 변경 시 커스텀 이벤트 발생 (다른 컴포넌트에 알림)
        window.dispatchEvent(new CustomEvent('profilePhotoUpdated', { 
          detail: { userId: currentUser?.id, photo: photoData } 
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Font Awesome 및 Google Fonts 로드
  useEffect(() => {
    const link1 = document.createElement('link');
    link1.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    link1.rel = 'stylesheet';
    document.head.appendChild(link1);
    
    const link2 = document.createElement('link');
    link2.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@700;800&display=swap';
    link2.rel = 'stylesheet';
    document.head.appendChild(link2);
    
    return () => {
      if (document.head.contains(link1)) document.head.removeChild(link1);
      if (document.head.contains(link2)) document.head.removeChild(link2);
    };
  }, []);

  // 프로필이 로드되지 않았을 때 로딩 표시
  if (!userProfile) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#F8FAFC',
        display: 'grid',
        placeItems: 'center',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '1rem',
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <h3 style={{ margin: 0, marginBottom: 8, color: '#1E293B' }}>프로필을 불러오는 중...</h3>
          <p style={{ color: '#64748B', margin: 0 }}>잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      fontFamily: "'Inter', sans-serif",
      color: '#1E293B'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '2rem 1rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '2rem'
      }}>
        {/* Left: Profile content */}
        <div style={{ gridColumn: isDesktop ? 'span 8' : 'span 12' }}>
          <div style={{
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
            overflow: 'hidden',
            marginBottom: '1.5rem',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)';
          }}>
            {/* 커버 이미지 */}
            <div 
              style={{ 
                width: '100%', 
                height: '160px', 
                background: coverImage 
                  ? `url(${coverImage}) center/cover`
                  : 'linear-gradient(to right, #DBEAFE, #E9D5FF, #FCE7F3)',
                position: 'relative',
                cursor: !isViewingOtherProfile ? 'pointer' : 'default'
              }}
              onClick={() => {
                if (!isViewingOtherProfile) {
                  setProfileEditOpen(true)
                }
              }}
            >
              {!isViewingOtherProfile && (
                <div style={{ 
                  position: 'absolute', 
                  top: '1rem', 
                  right: '1rem', 
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#2563EB',
                    border: '1px solid rgba(255, 255, 255, 0.5)'
                  }}>
                    Open for Work
                  </span>
                </div>
              )}
            </div>
            
            {/* 프로필 정보 영역 */}
            <div style={{ padding: '2rem', paddingBottom: '2rem', position: 'relative' }}>
              {/* 프로필 사진 - 절대 위치 */}
              <div style={{ 
                position: 'absolute',
                top: '-4rem',
                left: '2rem',
                padding: '4px',
                background: 'white',
                borderRadius: '50%'
              }}>
                <div 
                  style={{ 
                    position: 'relative',
                    width: '128px', 
                    height: '128px', 
                    borderRadius: '50%', 
                    overflow: 'hidden',
                    border: '4px solid white',
                    cursor: !isViewingOtherProfile ? 'pointer' : 'default',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    background: profilePhoto ? 'transparent' : '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => {
                    if (!isViewingOtherProfile) {
                      setPhotoChangeOpen(true)
                    }
                  }}
                >
                  {profilePhoto ? (
                    <img 
                      src={profilePhoto} 
                      alt="프로필 사진" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                    />
                  ) : (
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.basic.name}`}
                      alt="프로필"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  )}
                </div>
              </div>

              {/* 버튼들 - 오른쪽 상단 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem' }}>
                {!isViewingOtherProfile ? (
                  <>
                    <button 
                      onClick={() => {}}
                      style={{ 
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#475569',
                        background: 'white',
                        border: '1px solid #CBD5E1',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F8FAFC';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                      }}
                    >
                      <i className="fa-solid fa-share-nodes" style={{ marginRight: '0.25rem' }}></i> Share
                    </button>
                    <button 
                      onClick={() => setProfileEditOpen(true)}
                      style={{ 
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'white',
                        background: 'linear-gradient(135deg, #60A5FA 0%, #A855F7 100%)',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Edit Profile
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={async () => {
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
                    }}
                    disabled={loadingFollow}
                    style={{ 
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'white',
                      background: followCounts.isFollowing 
                        ? 'rgba(59, 130, 246, 0.1)' 
                        : 'linear-gradient(135deg, #60A5FA 0%, #A855F7 100%)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {followCounts.isFollowing ? '✓ 팔로잉' : '+ 팔로우'}
                  </button>
                )}
              </div>

              {/* 이름, 소개, 정보 */}
              <div style={{ marginTop: '1rem' }}>
                <h1 style={{ 
                  margin: 0, 
                  fontSize: '1.875rem', 
                  fontWeight: 700,
                  fontFamily: "'Manrope', sans-serif",
                  color: '#0F172A',
                  marginBottom: '0.25rem'
                }}>
                  {userProfile.basic.name}
                </h1>
                <p style={{ 
                  margin: 0, 
                  fontSize: '1.125rem', 
                  color: '#475569',
                  fontWeight: 500,
                  marginTop: '0.25rem',
                  marginBottom: '0.75rem'
                }}>
                  {headline || userProfile.goals || (isEnglish ? 'AI/ML Engineer & Full Stack Developer' : 'AI/ML 엔지니어 & 풀스택 개발자')}
                </p>
                
                {/* 위치, 학교, 웹사이트 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#64748B', marginTop: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <i className="fa-solid fa-location-dot"></i>
                    {isEnglish ? 'London, UK (Preparing)' : 'London, UK (준비 중)'}
                  </span>
                  {(userProfile.basic.school || userProfile.basic.major) && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <i className="fa-solid fa-graduation-cap"></i>
                      {userProfile.basic.school && userProfile.basic.major 
                        ? `${userProfile.basic.school}`
                        : userProfile.basic.school || userProfile.basic.major}
                    </span>
                  )}
                  {username && (
                    <a href="#" style={{ color: '#2563EB', textDecoration: 'none' }}
                       onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                       onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                      {username}
                    </a>
                  )}
                </div>

                {/* 태그 */}
                {userProfile.interests && userProfile.interests.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.25rem', marginBottom: '1.5rem' }}>
                    {userProfile.interests.slice(0, 4).map((tag, i) => {
                      const colors = [
                        { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
                        { bg: '#F3E8FF', text: '#6B21A8', border: '#E9D5FF' },
                        { bg: '#FED7AA', text: '#9A3412', border: '#FED7AA' },
                        { bg: '#CCFBF1', text: '#134E4A', border: '#99F6E4' }
                      ];
                      const color = colors[i % colors.length];
                      return (
                        <span 
                          key={i} 
                          style={{ 
                            padding: '0.25rem 0.75rem',
                            background: color.bg,
                            color: color.text,
                            border: `1px solid ${color.border}`,
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            fontWeight: 500
                          }}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* 팔로우/팔로잉 수 */}
                <div style={{ 
                  display: 'flex', 
                  gap: '1.5rem', 
                  marginTop: '1.5rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid #F1F5F9'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>
                      {followCounts.followersCount.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Followers
                    </span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>
                      {followCounts.followingCount}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Following
                    </span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: '#2563EB' }}>
                      Top 1%
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Ranking
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
            minHeight: '500px',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              borderBottom: '1px solid #E2E8F0',
              padding: '0 2rem'
            }}>
              <nav style={{ display: 'flex', gap: '2rem' }}>
                {(['자격/수료', '포트폴리오', '게시물', '단체/활동'] as Tab[]).map(t => {
                  const tabLabels: Record<Tab, { ko: string; en: string }> = {
                    '자격/수료': { ko: '자격/수료', en: 'Qualifications' },
                    '수상/성과': { ko: '수상/성과', en: 'Awards' },
                    '경력': { ko: '경력', en: 'Career' },
                    '포트폴리오': { ko: '포트폴리오', en: 'Portfolio' },
                    '단체/활동': { ko: '단체/활동', en: 'Network' },
                    '게시물': { ko: '게시물', en: 'Posts' }
                  }
                  const isActive = tab === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      style={{
                        position: 'relative',
                        color: isActive ? '#2563EB' : '#64748B',
                        padding: '1rem 0',
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 500,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.color = '#0F172A';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.color = '#64748B';
                      }}
                    >
                      {isEnglish ? tabLabels[t].en : tabLabels[t].ko}
                      {isActive && (
                        <div style={{
                          position: 'absolute',
                          bottom: '-1px',
                          left: 0,
                          width: '100%',
                          height: '2px',
                          background: 'linear-gradient(90deg, #60A5FA, #A855F7)'
                        }} />
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>
            <div style={{ padding: '2rem' }}>
              {tab === '자격/수료' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {!isViewingOtherProfile && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                      <button 
                        onClick={()=>setOpenCred(true)}
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#2563EB',
                          background: 'white',
                          border: '1px solid #2563EB',
                          borderRadius: '0.5rem',
                          cursor: 'pointer'
                        }}
                      >
                        {isEnglish ? '+ New Credential' : '+ 새 자격/수료'}
                      </button>
                    </div>
                  )}
                  {userProfile.credentials.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B' }}>
                      {isEnglish ? 'No credentials yet' : '아직 자격증이 없습니다'}
                    </div>
                  ) : (
                    userProfile.credentials.map((cred, i) => (
                      <div 
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '1rem',
                          padding: '1rem',
                          borderRadius: '0.75rem',
                          border: '1px solid transparent',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#F8FAFC';
                          e.currentTarget.style.borderColor = '#E2E8F0';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'transparent';
                        }}
                      >
                        <div style={{
                          width: '3rem',
                          height: '3rem',
                          background: 'white',
                          border: '1px solid #E2E8F0',
                          borderRadius: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0.5rem',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}>
                          {cred.issuer === 'Amazon Web Services' || cred.issuer?.includes('AWS') ? (
                            <img 
                              src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
                              alt="AWS"
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          ) : cred.issuer === 'Google' || cred.name?.includes('TensorFlow') ? (
                            <img 
                              src="https://upload.wikimedia.org/wikipedia/commons/2/2d/Tensorflow_logo.svg"
                              alt="TensorFlow"
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          ) : (
                            <img 
                              src={`https://logo.clearbit.com/${cred.issuer?.toLowerCase().replace(/\s+/g, '')}.com`}
                              alt={cred.issuer}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48';
                              }}
                            />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ 
                            margin: 0, 
                            marginBottom: '0.25rem',
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: '#0F172A'
                          }}>
                            {cred.name}
                          </h3>
                          <p style={{ 
                            margin: 0, 
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            color: '#64748B'
                          }}>
                            {cred.issuer} • {isEnglish ? 'Issued Jan 2026' : '발급일 2026년 1월'}
                          </p>
                          {cred.verified ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              background: '#D1FAE5',
                              color: '#065F46'
                            }}>
                              <i className="fa-solid fa-check-circle" style={{ marginRight: '0.25rem', fontSize: '0.75rem' }}></i> Verified
                            </span>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                background: '#FEE2E2',
                                color: '#991B1B'
                              }}>
                                {isEnglish ? '🔘 Unverified' : '🔘 비인증'}
                              </span>
                              {!isViewingOtherProfile && (
                                <button 
                                  onClick={()=>setOpenVerify(true)}
                                  style={{
                                    padding: '0.25rem 0.75rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    color: '#2563EB',
                                    background: 'white',
                                    border: '1px solid #2563EB',
                                    borderRadius: '0.25rem',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isEnglish ? 'Request Verification' : '인증 요청'}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
          {tab === '수상/성과' && (
            <div>
              {!isViewingOtherProfile && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 8 }}>
                  <button className="badge" onClick={()=>setOpenAward(true)}>
                    {isEnglish ? '+ Add Award' : '+ 수상/성과 추가'}
                  </button>
                </div>
              )}
              <ul style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {userProfile.awards.map((award, i) => (
                  <li key={i}>
                    <strong>{award.name}</strong> ({award.organization}, {award.year}){' '}
                    <span className="verify verify--ok">Verified ({award.organization})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {tab === '경력' && (
            <div>
              {!isViewingOtherProfile && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 8 }}>
                  <button className="badge" onClick={()=>setOpenCareer(true)}>
                    {isEnglish ? '+ Add Career' : '+ 경력 추가'}
                  </button>
                </div>
              )}
              <ul style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {userProfile.careers.map((career, i) => (
                  <li key={i}>
                    <strong>{career.company}</strong> - {career.role} ({career.period}){' '}
                    {career.verified ? (
                      <span className="verify verify--ok">Verified ({career.company})</span>
                    ) : (
                      <>
                        <span className="verify verify--pending">
                          {isEnglish ? '🔘 Unverified' : '🔘 비인증'}
                        </span>
                        {!isViewingOtherProfile && (
                          <button className="badge" onClick={()=>setOpenVerify(true)}>
                            {isEnglish ? 'Request Verification' : '인증 요청'}
                          </button>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {tab === '포트폴리오' && (
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {/* 프로젝트 목록 (프로젝트 관리 페이지에서 생성한 프로젝트) */}
              {!isViewingOtherProfile && projects.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ marginBottom: 12, fontSize: 16, fontWeight: 600 }}>
                    {isEnglish ? 'Projects' : '프로젝트'}
                  </h4>
                  {loadingProjects ? (
                    <div className="helper" style={{ textAlign: 'center', padding: 20 }}>
                      {isEnglish ? 'Loading projects...' : '프로젝트를 불러오는 중...'}
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                      {projects.map(project => (
                        <div
                          key={project.id}
                          className="panel"
                          style={{
                            padding: 16,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            border: '1px solid var(--border)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--brand)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 111, 255, 0.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border)'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <h5 style={{ margin: 0, marginBottom: 8, fontSize: 16, fontWeight: 700 }}>
                                {project.title}
                              </h5>
                              <p style={{ margin: 0, marginBottom: 8, color: 'var(--muted)', fontSize: 13 }}>
                                {project.description}
                              </p>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {project.tags?.map((tag: string, i: number) => (
                                  <span key={i} className="chip" style={{ fontSize: 11 }}>
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <span className="badge" style={{ fontSize: 11 }}>
                              {project.isOngoing 
                                ? (isEnglish ? 'Ongoing' : '진행 중')
                                : (isEnglish ? 'Completed' : '완료')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 기존 포트폴리오 목록 */}
              {userProfile.portfolios.map((port, i) => (
                <div key={i} className="panel" style={{ padding: 12, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{port.name}</strong>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {!isViewingOtherProfile && (
                        <button className="badge" onClick={() => setEditOpen(true)}>
                          {isEnglish ? '✏ Edit' : '✏ 수정'}
                        </button>
                      )}
                      {port.verified && <span className="badge">Verified</span>}
                    </div>
                  </div>
                  <div className="helper">
                    {isEnglish ? 'Role' : '역할'}: {port.role} · {isEnglish ? 'Stack' : '스택'}: {port.techStack} · {isEnglish ? 'Period' : '기간'}: {port.period}
                  </div>
                  <div className="helper">
                    {isEnglish ? 'Achievements' : '성과'}: {port.achievements}
                  </div>
                  <div className="panel" style={{ padding: 10, marginTop: 8, background: '#F7F9FB' }}>
                    <strong>🤖 {isEnglish ? 'Clone Insights' : '클론 인사이트'}</strong>
                    <ul style={{ marginTop: 6 }}>
                      <li>
                        {isEnglish 
                          ? "This project contributed to +12% growth in 'AI Platform Architecture Design' capability"
                          : "이 프로젝트를 통해 'AI 플랫폼 아키텍처 설계' 역량 +12% 성장"}
                      </li>
                      <li>
                        {isEnglish 
                          ? 'Multiple collaboration records have been registered'
                          : '다수의 협업 기록이 등록되었습니다'}
                      </li>
                    </ul>
                  </div>
                </div>
              ))}
              {!isViewingOtherProfile && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                  <button className="badge" onClick={() => navigate('/projects')}>
                    {isEnglish ? '+ Manage Projects' : '+ 프로젝트 관리'}
                  </button>
                  <button className="badge" onClick={()=>setOpenPort(true)}>
                    {isEnglish ? '+ Add Portfolio' : '+ 포트폴리오 추가'}
                  </button>
                </div>
              )}
            </div>
          )}
          {tab === '게시물' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {!isViewingOtherProfile ? (
                <>
                  {loadingPosts ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B' }}>{t('post.loadingPosts')}</div>
                  ) : myPosts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B' }}>
                      {t('post.noMyPosts')}
                      <br />
                      <span style={{ fontSize: '0.75rem' }}>{t('post.noMyPostsDesc')}</span>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {myPosts.map(post => (
                        <PostCard
                          key={post.id}
                          id={post.id}
                          author={post.author}
                          authorId={post.authorId}
                          verified={post.verified}
                          title={post.title}
                          content={post.content}
                          tags={post.tags}
                          likes={post.likes}
                          comments={post.comments}
                          timestamp={post.timestamp}
                          isLiked={post.isLiked}
                          onEdit={handleEditPost}
                          onDelete={handleDeletePost}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B' }}>
                  {isEnglish ? 'This user has no posts yet' : '이 사용자는 아직 게시물이 없습니다'}
                </div>
              )}
            </div>
          )}
          {tab === '단체/활동' && (
            <div>
              {!isViewingOtherProfile && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 8 }}>
                  <button className="badge" onClick={()=>setOpenOrg(true)}>
                    {isEnglish ? '+ Add Organization' : '+ 단체/활동 추가'}
                  </button>
                </div>
              )}
              <ul style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {userProfile.organizations.map((org, i) => (
                  <li key={i}>
                    {org.name}{' '}
                    {org.verified ? (
                      <span className="verify verify--ok">Verified ({org.name})</span>
                    ) : (
                      <>
                        <span className="verify verify--pending">
                          {isEnglish ? '🔘 Unverified' : '🔘 비인증'}
                        </span>
                        {!isViewingOtherProfile && (
                          <button className="badge" onClick={()=>setOpenVerify(true)}>
                            {isEnglish ? 'Request Verification' : '인증 요청'}
                          </button>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
            </div>
          </div>

        </div>

        {/* Right: Sidebar */}
        <div style={{ 
          gridColumn: isDesktop ? 'span 4' : 'span 12'
        }}>
          {/* Skill Insights */}
          <div style={{
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              margin: 0,
              marginBottom: '1.5rem',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              Skill Insights
              <i className="fa-solid fa-circle-info" style={{ color: '#94A3B8', fontSize: '0.875rem' }}></i>
            </h3>
            
            {userProfile.topSkills && userProfile.topSkills.length > 0 ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0.5rem' }}>
                {userProfile.topSkills.slice(0, 3).map((skill, index) => {
                  const percent = skill.score || 0;
                  const colors = ['#8B5CF6', '#3B82F6', '#EC4899'];
                  const color = colors[index % colors.length];
                  const labels = ['AI/ML', 'Dev', 'Branding'];
                  return (
                    <div 
                      key={index} 
                      style={{ textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}>
                      <div style={{
                        position: 'relative',
                        width: '5rem',
                        height: '5rem',
                        margin: '0 auto',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#F1F5F9'
                      }}>
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: '50%',
                          background: `conic-gradient(${color} ${percent}%, #E2E8F0 0)`
                        }}></div>
                        <div style={{
                          position: 'absolute',
                          inset: '0.5rem',
                          background: 'white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                            {percent}%
                          </span>
                        </div>
                      </div>
                      <span style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#64748B',
                        marginTop: '0.5rem'
                      }}>
                        {labels[index] || skill.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#64748B' }}>
                {isEnglish ? 'No skill data yet' : '아직 스킬 데이터가 없습니다'}
              </div>
            )}
            
            {userProfile.topSkills && userProfile.topSkills.length > 0 && (
              <div style={{
                marginTop: '1.5rem',
                padding: '0.75rem',
                background: '#F8FAFC',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                color: '#64748B',
                lineHeight: 1.6,
                border: '1px solid #F1F5F9'
              }}>
                <i className="fa-solid fa-wand-magic-sparkles" style={{ color: '#8B5CF6', marginRight: '0.25rem' }}></i>
                <strong>AI Analysis:</strong> Your proficiency in AI/ML puts you in the top 5% of candidates for Tech Lead roles.
              </div>
            )}
          </div>

          {/* Growth Timeline */}
          <div style={{
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              margin: 0,
              marginBottom: '1rem',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#0F172A',
              fontFamily: "'Manrope', sans-serif"
            }}>
              Growth Timeline
            </h3>
            <div style={{ position: 'relative', paddingLeft: '0.5rem' }}>
              <div style={{
                position: 'absolute',
                left: '15px',
                top: '10px',
                bottom: 0,
                width: '2px',
                background: '#E2E8F0'
              }}></div>
              
              {userProfile.credentials.filter(c => c.verified).slice(0, 3).map((cred, i) => (
                <div key={i} style={{
                  position: 'relative',
                  paddingLeft: '2rem',
                  paddingBottom: i < 2 ? '2rem' : 0,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  const title = e.currentTarget.querySelector('p:first-of-type') as HTMLElement;
                  if (title) title.style.color = '#8B5CF6';
                }}
                onMouseLeave={(e) => {
                  const title = e.currentTarget.querySelector('p:first-of-type') as HTMLElement;
                  if (title) title.style.color = '#0F172A';
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '8px',
                    top: '6px',
                    width: '12px',
                    height: '12px',
                    background: i === 0 ? '#3B82F6' : 'white',
                    border: `2px solid ${i === 0 ? '#3B82F6' : '#CBD5E1'}`,
                    borderRadius: '50%',
                    boxShadow: i === 0 ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none',
                    transition: 'all 0.2s ease'
                  }}></div>
                  <span style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: i === 0 ? '#2563EB' : '#94A3B8',
                    marginBottom: '0.25rem'
                  }}>
                    Jan 2026
                  </span>
                  <p style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#0F172A',
                    transition: 'color 0.2s ease'
                  }}>
                    {cred.name}
                  </p>
                  <p style={{
                    margin: 0,
                    marginTop: '0.25rem',
                    fontSize: '0.75rem',
                    color: '#64748B'
                  }}>
                    {cred.issuer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Updated */}
          {userProfile.portfolios.length > 0 && (
            <div style={{
              background: 'linear-gradient(to bottom right, #0F172A, #1E293B)',
              border: 'none',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
              padding: '1.5rem',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '8rem',
                height: '8rem',
                background: '#3B82F6',
                borderRadius: '50%',
                filter: 'blur(60px)',
                opacity: 0.2,
                transform: 'translate(2.5rem, -2.5rem)'
              }}></div>
              <div style={{ position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    fontFamily: "'Manrope', sans-serif"
                  }}>
                    Portfolio Updated
                  </h3>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#93C5FD',
                    fontSize: '0.75rem',
                    borderRadius: '0.25rem',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}>
                    New
                  </span>
                </div>
                <p style={{
                  margin: 0,
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  color: '#CBD5E1'
                }}>
                  {userProfile.portfolios.length} new {userProfile.portfolios.length === 1 ? 'project has' : 'projects have'} been added to your portfolio this week.
                </p>
                <button style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: 'white',
                  color: '#0F172A',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F1F5F9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                }}>
                  View Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals and other components */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="프로젝트 수정">
        <div style={{ display: 'grid', gap: 8 }}>
          <label className="helper">제목/기간/역할/스택을 편집하세요 (데모)</label>
          <input className="input" placeholder="제목" />
          <input className="input" placeholder="기간" />
          <input className="input" placeholder="역할" />
          <input className="input" placeholder="스택" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="badge" onClick={() => setEditOpen(false)}>취소</button>
            <button className="button" onClick={() => { setEditOpen(false); addInsight('프로젝트가 업데이트되었습니다') }}>저장</button>
          </div>
        </div>
      </Modal>

      {/* Dedicated edit/verify forms */}
      <ProfileEditModal 
        open={profileEditOpen} 
        onClose={async () => {
          setProfileEditOpen(false)
          // 모달 닫을 때 프로필 다시 로드
          try {
            const updatedProfile = await getUserProfile()
            setUserProfile(updatedProfile)
          } catch (error) {
            console.error('프로필 새로고침 실패:', error)
          }
        }} 
        onSave={async (d) => {
          addInsight('프로필이 업데이트되었습니다')
          // 프로필 사진 업데이트
          if (d.profilePhoto) {
            setProfilePhoto(d.profilePhoto)
            localStorage.setItem(getStorageKey('baesh-profile-photo'), d.profilePhoto)
            // 프로필 사진 변경 시 커스텀 이벤트 발생 (다른 컴포넌트에 알림)
            window.dispatchEvent(new CustomEvent('profilePhotoUpdated', { 
              detail: { userId: currentUser?.id, photo: d.profilePhoto } 
            }))
          }
          // 커버 이미지 업데이트
          if (d.coverImage !== undefined) {
            setCoverImage(d.coverImage)
            if (d.coverImage) {
              localStorage.setItem(getStorageKey('baesh-cover-image'), d.coverImage)
            } else {
              localStorage.removeItem(getStorageKey('baesh-cover-image'))
            }
          }
          // 한 줄 소개 업데이트
          if (d.headline !== undefined) {
            setHeadline(d.headline)
            if (d.headline) {
              localStorage.setItem(getStorageKey('baesh-headline'), d.headline)
            } else {
              localStorage.removeItem(getStorageKey('baesh-headline'))
            }
          }
          // 사용자명 업데이트
          if (d.handle !== undefined) {
            setUsername(d.handle)
            if (d.handle) {
              localStorage.setItem(getStorageKey('baesh-username'), d.handle)
            } else {
              localStorage.removeItem(getStorageKey('baesh-username'))
            }
          }
          // 프로필 다시 로드
          try {
            const updatedProfile = await getUserProfile()
            setUserProfile(updatedProfile)
          } catch (error) {
            console.error('프로필 새로고침 실패:', error)
          }
        }} 
      />
      <CredentialFormModal open={openCred} onClose={()=>setOpenCred(false)} onSave={(d)=>addInsight('새 자격/수료가 추가되었습니다')} />
      <AwardFormModal open={openAward} onClose={()=>setOpenAward(false)} onSave={(d)=>addInsight('새 수상/성과가 추가되었습니다')} />
      <CareerFormModal open={openCareer} onClose={()=>setOpenCareer(false)} onSave={(d)=>addInsight('새 경력이 추가되었습니다')} />
      <PortfolioFormModal open={openPort} onClose={()=>setOpenPort(false)} onSave={(d)=>addInsight('새 프로젝트가 추가되었습니다')} />
      <OrganizationFormModal open={openOrg} onClose={()=>setOpenOrg(false)} onSave={(d)=>addInsight('새 단체/활동이 추가되었습니다')} />
      <VerificationModal open={openVerify} onClose={()=>setOpenVerify(false)} onSubmit={(d)=>addInsight('인증 요청이 접수되었습니다')} />

      {/* 게시물 수정 모달 */}
      <Modal 
        open={!!editPost} 
        onClose={() => {
          setEditPost(null)
          setEditContent('')
          setEditTags([])
        }}
        title={t('post.editPost')}
      >
        <div style={{ display: 'grid', gap: 16 }}>
          <textarea
            className="input"
            placeholder="내용을 입력하세요..."
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            style={{ minHeight: 120, resize: 'vertical', width: '100%', lineHeight: 1.6 }}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['AI', '창업', '데이터', '네트워킹'].map(tag => (
              <button
                key={tag}
                className={editTags.includes(tag) ? 'button' : 'button--ghost'}
                onClick={() => {
                  if (editTags.includes(tag)) {
                    setEditTags(editTags.filter(t => t !== tag))
                  } else {
                    setEditTags([...editTags, tag])
                  }
                }}
                style={{ fontSize: 12, height: 32, padding: '0 12px' }}
              >
                #{tag}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              className="button--ghost"
              onClick={() => {
                setEditPost(null)
                setEditContent('')
                setEditTags([])
              }}
              style={{ fontSize: 13, height: 36 }}
            >
              취소
            </button>
            <button
              className="button"
              onClick={handleUpdatePost}
              disabled={!editContent.trim()}
              style={{ fontSize: 13, height: 36 }}
            >
              수정 완료
            </button>
          </div>
        </div>
      </Modal>

      {/* Photo Change Modal */}
      <Modal open={photoChangeOpen} onClose={() => setPhotoChangeOpen(false)} title="프로필 사진 변경">
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div 
              style={{ 
                width: 150, 
                height: 150, 
                borderRadius: 999, 
                overflow: 'hidden',
                border: '3px solid #1E6FFF',
                margin: '0 auto 16px',
                boxShadow: '0 4px 12px rgba(30, 111, 255, 0.2)',
                background: profilePhoto ? 'transparent' : 'linear-gradient(135deg, #1E6FFF, #408CFF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {profilePhoto ? (
                <img 
                  src={profilePhoto} 
                  alt="현재 프로필 사진" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                />
              ) : (
                <span style={{ fontSize: 64, color: 'white' }}>👤</span>
              )}
            </div>
            <p className="helper">{profilePhoto ? '현재 프로필 사진' : '프로필 사진이 없습니다'}</p>
          </div>

          <div className="panel" style={{ padding: 16, background: '#F7F9FB' }}>
            <strong>📷 새 사진 업로드</strong>
            <p className="helper" style={{ marginTop: 8 }}>
              JPG, PNG, GIF 형식 지원 (최대 5MB)
            </p>
            <input 
              type="file" 
              accept="image/*"
              onChange={handlePhotoChange}
              style={{
                marginTop: 12,
                width: '100%',
                padding: '12px',
                border: '2px dashed #1E6FFF',
                borderRadius: '8px',
                cursor: 'pointer',
                background: 'white'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="badge" onClick={() => setPhotoChangeOpen(false)}>취소</button>
          </div>
        </div>
      </Modal>

      {/* 팔로워/팔로잉 목록 모달 */}
      <FollowListModal
        open={followListOpen}
        onClose={() => setFollowListOpen(false)}
        userId={userId || currentUser?.id || ''}
        type={followListType}
      />
    </div>
  )
}


