import Modal from '../components/Modal'
import { useState, useEffect, useRef } from 'react'
import { getUserProfile, type UserProfile } from '../services/userProfileService'
import { apiPut } from '../utils/api'
import { useAuth } from '../auth/AuthContext'

// 이미지 압축 함수
const compressImage = (file: File, maxWidth: number, maxHeight: number, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        
        // 비율 유지하면서 크기 조정
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        
        // JPEG로 압축 (투명 배경은 흰색으로)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }
      img.onerror = () => reject(new Error('이미지 로드 실패'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('파일 읽기 실패'))
    reader.readAsDataURL(file)
  })
}

interface ProfileEditModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: any) => void
}

export default function ProfileEditModal({ open, onClose, onSave }: ProfileEditModalProps) {
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 사용자 ID를 키로 사용하여 각 계정별로 분리
  const getStorageKey = (key: string) => {
    const userId = currentUser?.id || 'default'
    return `${key}-${userId}`
  }

  // 프로필 데이터 로드
  useEffect(() => {
    if (open) {
      const loadProfile = async () => {
        try {
          const data = await getUserProfile()
          setProfile(data)
        } catch (error) {
          console.error('프로필 로드 실패:', error)
        }
      }
      loadProfile()
    }
  }, [open])

  // 폼 상태
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [headline, setHeadline] = useState('')
  const [handle, setHandle] = useState('')
  const [school, setSchool] = useState('')
  const [major, setMajor] = useState('')
  const [enrollmentYear, setEnrollmentYear] = useState('')
  const [status, setStatus] = useState<string[]>([])
  const [interests, setInterests] = useState<string[]>([])
  const [currentRole, setCurrentRole] = useState('')
  const [careerSummary, setCareerSummary] = useState('')
  const [github, setGithub] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [notion, setNotion] = useState('')
  const [instagram, setInstagram] = useState('')
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  // 프로필 데이터로 폼 초기화
  useEffect(() => {
    if (open) {
      // localStorage에서 저장된 데이터 로드 (사용자 ID 포함)
      const savedPhoto = localStorage.getItem(getStorageKey('baesh-profile-photo'))
      const savedCover = localStorage.getItem(getStorageKey('baesh-cover-image'))
      const savedHeadline = localStorage.getItem(getStorageKey('baesh-headline'))
      const savedUsername = localStorage.getItem(getStorageKey('baesh-username'))
      if (savedPhoto) setProfilePhoto(savedPhoto)
      if (savedCover) setCoverImage(savedCover)
      if (savedHeadline) setHeadline(savedHeadline)
      if (savedUsername) setHandle(savedUsername)
    }
    
    if (profile) {
      setName(profile.basic.name || '')
      setNickname(profile.basic.nickname || '')
      setHeadline(localStorage.getItem('baesh-headline') || '') // 한 줄 소개
      setHandle(localStorage.getItem('baesh-username') || '') // 사용자 ID
      setSchool(profile.basic.school || '')
      setMajor(profile.basic.major || '')
      setEnrollmentYear('')
      setStatus(Array.isArray(profile.basic.status) ? profile.basic.status : [])
      setInterests(Array.isArray(profile.interests) ? profile.interests : [])
      setCurrentRole('')
      setCareerSummary(profile.goals || '')
      setGithub('')
      setLinkedin('')
      setNotion('')
      setInstagram('')
    }
  }, [profile, open])

  // 프로필 사진 업로드 (자동 압축)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        // 프로필 사진: 최대 400x400, 품질 80%
        const compressed = await compressImage(file, 400, 400, 0.8)
        setProfilePhoto(compressed)
      } catch (error) {
        console.error('이미지 압축 실패:', error)
        alert('이미지 처리에 실패했습니다. 다른 이미지를 시도해주세요.')
      }
    }
  }

  // 커버 이미지 업로드 (자동 압축)
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        // 커버 이미지: 최대 1200x600, 품질 80%
        const compressed = await compressImage(file, 1200, 600, 0.8)
        setCoverImage(compressed)
      } catch (error) {
        console.error('이미지 압축 실패:', error)
        alert('이미지 처리에 실패했습니다. 다른 이미지를 시도해주세요.')
      }
    }
  }

  // 태그 추가
  const addTag = (tag: string, setTags: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (tag.trim() && !interests.includes(tag.trim())) {
      setTags(prev => [...prev, tag.trim()])
    }
  }

  // 태그 제거
  const removeTag = (tagToRemove: string, setTags: React.Dispatch<React.SetStateAction<string[]>>) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  // 상태 선택
  const statusOptions = ['재학', '휴학', '졸업 예정', '졸업', '석사', '박사']
  const toggleStatus = (option: string) => {
    setStatus(prev => 
      prev.includes(option) 
        ? prev.filter(s => s !== option)
        : [...prev, option]
    )
  }

  // 저장
  const handleSave = async () => {
    try {
      // API 호출을 위해 필요한 데이터만 전송
      const updateData: any = {
        nickname: nickname || undefined,
        school: school || undefined,
        major: major || undefined,
        status: status.length > 0 ? status : undefined,
        interests: interests.length > 0 ? interests : undefined,
        goals: careerSummary || undefined,
      }

      // 빈 값 제거
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === '') {
          delete updateData[key]
        }
      })

      // 프로필 사진 및 추가 정보를 API에 전송
      if (profilePhoto) {
        updateData.profilePhoto = profilePhoto
      }
      if (coverImage) {
        updateData.coverImage = coverImage
      }
      if (headline) {
        updateData.headline = headline
      }
      if (handle) {
        updateData.username = handle
      }

      // API 호출
      await apiPut('/users/profile', updateData)

      // 프로필 사진 및 추가 정보를 localStorage에 저장 (사용자 ID 포함)
      if (profilePhoto) {
        localStorage.setItem(getStorageKey('baesh-profile-photo'), profilePhoto)
      }
      if (coverImage) {
        localStorage.setItem(getStorageKey('baesh-cover-image'), coverImage)
      }
      if (headline) {
        localStorage.setItem(getStorageKey('baesh-headline'), headline)
      }
      if (handle) {
        localStorage.setItem(getStorageKey('baesh-username'), handle)
      }
      
      // 프로필 사진 변경 시 커스텀 이벤트 발생 (다른 컴포넌트에 알림)
      if (profilePhoto) {
        window.dispatchEvent(new CustomEvent('profilePhotoUpdated', { 
          detail: { userId: currentUser?.id, photo: profilePhoto } 
        }))
      }

      // 성공 시 콜백 호출 (프로필 새로고침 포함)
      await onSave({
        nickname,
        school,
        major,
        status,
        interests,
        careerSummary,
        socialLinks: {
          github,
          linkedin,
          notion,
          instagram,
        },
        profilePhoto,
        coverImage,
        headline,
        handle,
      })
      
      onClose()
    } catch (error) {
      console.error('프로필 저장 실패:', error)
      alert(`프로필 저장에 실패했습니다: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      title="" 
      style={{ 
        maxWidth: 900, 
        width: 'min(900px, 95vw)',
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'calc(100vh - 32px)' }}>
        {/* 상단 헤더 */}
        <div style={{ 
          padding: '24px 32px', 
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>프로필 수정</h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button 
              className="button--ghost" 
              onClick={onClose}
              style={{ fontSize: 14, height: 36, padding: '0 16px' }}
            >
              취소
            </button>
            <button
              className="button"
              onClick={handleSave}
              style={{ 
                fontSize: 14, 
                height: 36, 
                padding: '0 20px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, var(--brand), var(--accent))',
                boxShadow: '0 2px 8px rgba(30, 111, 255, 0.3)',
              }}
            >
              저장하기
            </button>
          </div>
        </div>

        {/* 메인 콘텐츠 - 스크롤 가능 영역 */}
        <div style={{ 
          flex: 1,
          overflow: 'auto',
          padding: '32px',
        }}>
          {/* 커버 이미지 섹션 */}
          <section style={{ marginBottom: 32 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 600 }}>커버 이미지 (선택)</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: 13, color: 'var(--muted)' }}>
              프로필 상단에 표시되는 커버 이미지를 추가하세요.
            </p>
            <div
              style={{
                width: '100%',
                height: 200,
                borderRadius: 12,
                background: coverImage 
                  ? `url(${coverImage}) center/cover`
                  : 'linear-gradient(135deg, #1E6FFF 0%, #408CFF 50%, #6366F1 100%)',
                position: 'relative',
                cursor: 'pointer',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
              onClick={() => coverInputRef.current?.click()}
            >
              {!coverImage && (
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                  <div style={{ fontSize: 14 }}>커버 이미지 추가</div>
                </div>
              )}
              {coverImage && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCoverImage(null)
                  }}
                >
                  제거
                </div>
              )}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              style={{ display: 'none' }}
            />
          </section>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            gap: 32,
            minHeight: 'min-content'
          }}>
          {/* 왼쪽: 프로필 사진 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: profilePhoto 
                  ? `url(${profilePhoto}) center/cover`
                  : 'linear-gradient(135deg, #1E6FFF, #408CFF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer',
                border: '4px solid var(--panel)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {!profilePhoto && (
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              )}
              <div
                style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
            <button
              className="button--ghost"
              onClick={() => fileInputRef.current?.click()}
              style={{ fontSize: 14, height: 36 }}
            >
              사진 변경
            </button>
          </div>

          {/* 오른쪽: 정보 입력 카드 */}
          <div style={{ display: 'grid', gap: 32 }}>
            {/* ① 프로필 기본 정보 */}
            <section>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 600 }}>프로필 기본 정보</h3>
              <p style={{ margin: '0 0 24px 0', fontSize: 13, color: 'var(--muted)' }}>
                다른 사용자들이 볼 수 있는 기본 정보를 입력하세요.
              </p>
              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                    이름 *
                  </label>
                  <input
                    className="input"
                    placeholder="이름을 입력하세요"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                    한 줄 소개
                  </label>
                  <input
                    className="input"
                    placeholder="예: AI와 데이터를 통해 세상을 바꾸는 창업형 개발자"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                    사용자 ID
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16, color: 'var(--muted)' }}>@</span>
                    <input
                      className="input"
                      placeholder="username"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                  <p style={{ margin: '6px 0 0 0', fontSize: 12, color: 'var(--muted)' }}>
                    다른 사용자들이 당신을 찾을 때 사용하는 고유 ID입니다.
                  </p>
                </div>
              </div>
            </section>

            {/* ② 교육 / 소속 */}
            <section style={{ paddingTop: 24, borderTop: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 600 }}>교육 / 소속</h3>
              <p style={{ margin: '0 0 24px 0', fontSize: 13, color: 'var(--muted)' }}>
                학력 정보를 입력하세요.
              </p>
              <div style={{ display: 'grid', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                      학교명
                    </label>
                    <input
                      className="input"
                      placeholder="학교명"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                      전공
                    </label>
                    <input
                      className="input"
                      placeholder="전공명"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                      입학년도
                    </label>
                    <input
                      className="input"
                      placeholder="예: 2020"
                      type="number"
                      value={enrollmentYear}
                      onChange={(e) => setEnrollmentYear(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                      현재 상태
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {statusOptions.map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleStatus(option)}
                          className={status.includes(option) ? 'button' : 'button--ghost'}
                          style={{
                            height: 32,
                            padding: '0 12px',
                            fontSize: 13,
                            border: status.includes(option) ? 'none' : undefined,
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ③ 핵심 포지션 / 관심 분야 */}
            <section style={{ paddingTop: 24, borderTop: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 600 }}>핵심 포지션 / 관심 분야</h3>
              <p style={{ margin: '0 0 24px 0', fontSize: 13, color: 'var(--muted)' }}>
                당신의 전문 분야와 관심사를 태그로 추가하세요. AI가 관련 추천을 제공합니다.
              </p>
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {interests.map(tag => (
                    <span
                      key={tag}
                      className="chip"
                      onClick={() => removeTag(tag, setInterests)}
                      style={{ cursor: 'pointer', fontSize: 13 }}
                    >
                      {tag} ×
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="input"
                    placeholder="태그 입력 (예: AI, Backend, Startup)"
                    style={{ flex: 1 }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTag(e.currentTarget.value, setInterests)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <button
                    className="button--ghost"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      if (input) {
                        addTag(input.value, setInterests)
                        input.value = ''
                      }
                    }}
                    style={{ fontSize: 13, height: 40, padding: '0 16px' }}
                  >
                    추가
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['AI', 'Data', 'Backend', 'Frontend', 'Startup', 'PM', 'Design'].map(suggested => (
                    <button
                      key={suggested}
                      type="button"
                      className="button--ghost"
                      onClick={() => addTag(suggested, setInterests)}
                      style={{ fontSize: 12, height: 28, padding: '0 10px' }}
                    >
                      + {suggested}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* ④ 경력 / 활동 요약 */}
            <section style={{ paddingTop: 24, borderTop: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 600 }}>경력 / 활동 요약</h3>
              <p style={{ margin: '0 0 24px 0', fontSize: 13, color: 'var(--muted)' }}>
                현재 직무와 간단한 경력 요약을 입력하세요.
              </p>
              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                    현재 직무
                  </label>
                  <input
                    className="input"
                    placeholder="예: 학생, 창업자, 개발자, PM"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                    경력 요약
                  </label>
                  <textarea
                    className="input"
                    placeholder="1~2줄로 간단히 요약해주세요"
                    value={careerSummary}
                    onChange={(e) => setCareerSummary(e.target.value)}
                    style={{ width: '100%', minHeight: 80, resize: 'vertical' }}
                  />
                </div>
              </div>
            </section>

            {/* ⑤ 소셜 링크 */}
            <section style={{ paddingTop: 24, borderTop: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 600 }}>소셜 링크</h3>
              <p style={{ margin: '0 0 24px 0', fontSize: 13, color: 'var(--muted)' }}>
                포트폴리오와 소셜 프로필을 연결하세요.
              </p>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                    GitHub
                  </label>
                  <input
                    className="input"
                    placeholder="github.com/username"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                    LinkedIn
                  </label>
                  <input
                    className="input"
                    placeholder="linkedin.com/in/username"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                    Notion 포트폴리오
                  </label>
                  <input
                    className="input"
                    placeholder="notion.so/your-portfolio"
                    value={notion}
                    onChange={(e) => setNotion(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                    Instagram (선택)
                  </label>
                  <input
                    className="input"
                    placeholder="instagram.com/username"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </section>
          </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
