import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'

// 키워드 사전 (한국어 + 영어)
const KEYWORD_DICTIONARY: Record<string, string[]> = {
  'AI': ['ai', 'AI', '인공지능', '머신러닝', 'machine learning', 'ml', 'ML', '딥러닝', 'deep learning', 'gpt', 'GPT', 'llm', 'LLM', '챗봇', 'chatbot'],
  '창업': ['창업', '스타트업', 'startup', '사업', '비즈니스', 'business', '벤처', 'venture', '기업가', 'entrepreneur', '투자', 'investment'],
  '개발': ['개발', 'develop', '코딩', 'coding', '프로그래밍', 'programming', '소프트웨어', 'software', '앱', 'app', '웹', 'web'],
  '데이터': ['데이터', 'data', '분석', 'analytics', 'sql', 'SQL', '파이썬', 'python', '통계', 'statistics', '시각화', 'visualization'],
  '디자인': ['디자인', 'design', 'UI', 'UX', 'ui', 'ux', '피그마', 'figma', '포토샵', 'photoshop', '일러스트'],
  '마케팅': ['마케팅', 'marketing', '광고', 'advertising', '브랜딩', 'branding', 'sns', 'SNS', '콘텐츠', 'content'],
  '취업': ['취업', '취준', '면접', 'interview', '이력서', 'resume', '자소서', '채용', 'hiring', '합격'],
  '네트워킹': ['네트워킹', 'networking', '인맥', '커뮤니티', 'community', '모임', '밋업', 'meetup', '협업', 'collaboration'],
  '프로젝트': ['프로젝트', 'project', '포트폴리오', 'portfolio', '사이드', 'side', '팀', 'team'],
  '교육': ['교육', 'education', '강의', '수업', '부트캠프', 'bootcamp', '수료', '인증', '자격증'],
  '해커톤': ['해커톤', 'hackathon', '대회', 'competition', '공모전', '수상'],
  '클라우드': ['클라우드', 'cloud', 'aws', 'AWS', 'azure', 'gcp', 'GCP', '서버', 'server', '인프라'],
  '블록체인': ['블록체인', 'blockchain', '암호화폐', 'crypto', 'web3', 'Web3', 'nft', 'NFT', '이더리움'],
  '모바일': ['모바일', 'mobile', 'ios', 'iOS', 'android', '안드로이드', '앱', 'flutter', 'react native'],
}

// 내용에서 키워드 추출
const extractKeywords = (text: string): string[] => {
  const foundKeywords: string[] = []
  const lowerText = text.toLowerCase()
  
  for (const [keyword, patterns] of Object.entries(KEYWORD_DICTIONARY)) {
    for (const pattern of patterns) {
      if (lowerText.includes(pattern.toLowerCase())) {
        if (!foundKeywords.includes(keyword)) {
          foundKeywords.push(keyword)
        }
        break
      }
    }
  }
  
  // 최대 2개만 반환
  return foundKeywords.slice(0, 2)
}

export default function PostComposer({ onPost }: { onPost: (data: any) => void }) {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const [content, setContent] = useState('')
  const [showAI, setShowAI] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  
  // 내용에서 자동 추출된 태그
  const autoTags = useMemo(() => extractKeywords(content), [content])
  
  // 현재 사용자의 프로필 사진 가져오기 (사용자 ID 포함)
  useEffect(() => {
    const loadProfilePhoto = () => {
      if (currentUser?.id) {
        const photo = localStorage.getItem(`baesh-profile-photo-${currentUser.id}`)
        setProfilePhoto(photo)
      }
    }
    
    loadProfilePhoto()
    
    // localStorage 변경 감지를 위한 이벤트 리스너 (다른 탭에서의 변경)
    const handleStorageChange = (e: StorageEvent) => {
      if (currentUser?.id && e.key === `baesh-profile-photo-${currentUser.id}`) {
        setProfilePhoto(e.newValue)
      }
    }
    
    // 같은 탭에서의 프로필 사진 변경 감지 (커스텀 이벤트)
    const handleProfilePhotoUpdated = (e: CustomEvent) => {
      if (currentUser?.id && e.detail?.userId === currentUser.id) {
        setProfilePhoto(e.detail.photo)
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('profilePhotoUpdated', handleProfilePhotoUpdated as EventListener)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('profilePhotoUpdated', handleProfilePhotoUpdated as EventListener)
    }
  }, [currentUser?.id])

  const handlePost = () => {
    if (content.trim().length === 0) return // 빈 글만 방지, 글자수 제한 없음
    // 자동 추출된 태그 사용 (없으면 빈 배열)
    onPost({ content, tags: autoTags.length > 0 ? autoTags : [] })
    setContent('')
    setShowAI(false)
  }

  return (
    <div className="panel" style={{ padding: 16, marginBottom: 16, background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 12 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div 
          style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 999, 
            background: profilePhoto 
              ? 'transparent' 
              : 'linear-gradient(135deg, #1E6FFF, #408CFF)', 
            flexShrink: 0,
            overflow: 'hidden'
          }}
        >
          {profilePhoto ? (
            <img 
              src={profilePhoto} 
              alt="프로필"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18 }}>
              👤
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <textarea
            className="input"
            placeholder={t('common.whatAreYouThinking')}
            value={content}
            onChange={e => setContent(e.target.value)}
            style={{ minHeight: 80, resize: 'vertical', width: '100%', lineHeight: 1.6 }}
          />
          {/* 자동 추출 태그 표시 */}
          {autoTags.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>🏷️ {t('post.autoTagLabel')}</span>
              {autoTags.map(tag => (
                <span 
                  key={tag} 
                  className="chip" 
                  style={{ 
                    fontSize: 11, 
                    padding: '2px 8px', 
                    height: 'auto',
                    background: 'rgba(30,111,255,0.1)',
                    color: 'var(--brand)',
                    border: '1px solid rgba(30,111,255,0.2)'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          {showAI && (
            <div className="panel" style={{ padding: 10, marginTop: 8, background: 'rgba(30,111,255,0.05)', border: '1px solid rgba(30,111,255,0.15)' }}>
              <div style={{ fontSize: 12, color: 'var(--brand)' }}>
                🧠 <strong>{t('post.aiInsight')}</strong> {t('post.aiInsightText', { topics: autoTags.length > 0 ? autoTags.join(', ') : t('post.aiInsightGeneral') })}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="badge" style={{ fontSize: 12 }}>📎 {t('post.image')}</button>
            <button className="badge" style={{ fontSize: 12 }}>🔗 {t('post.link')}</button>
            <button className="badge" style={{ fontSize: 12 }} onClick={() => setShowAI(!showAI)}>🧠 {t('post.aiInsightBtn')}</button>
            <button className="badge" style={{ fontSize: 12 }}>📅 {t('post.schedule')}</button>
            <button
              className="button"
              onClick={handlePost}
              disabled={content.trim().length === 0}
              style={{ marginLeft: 'auto', fontSize: 13, height: 36 }}
            >
              {t('post.postingBtn')} ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

