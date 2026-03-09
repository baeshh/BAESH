import { useState, useEffect } from 'react'
import Modal from './Modal'
import { useTranslation } from 'react-i18next'
import { apiGet, apiPost } from '../utils/api'
import { useAuth } from '../auth/AuthContext'

interface User {
  id: string
  name: string
  nickname?: string
  school?: string
  major?: string
  status?: string[]
  profilePhoto?: string
  isMutualFollow?: boolean
  commonTags?: string[]
  isAvailableForCollaboration?: boolean
  availableHours?: number
  preferredProjectTypes?: string[]
}

interface TeamInviteModalProps {
  open: boolean
  onClose: () => void
  projectId: string
  onInvite: (userIds: string[], message: string, role: string) => void
  requiredRole?: string
}

export default function TeamInviteModal({ open, onClose, projectId, onInvite, requiredRole }: TeamInviteModalProps) {
  const { t, i18n } = useTranslation()
  const isEnglish = i18n.language === 'en'
  const { user } = useAuth()
  const [following, setFollowing] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMutualFollow, setFilterMutualFollow] = useState(false)
  const [filterAvailable, setFilterAvailable] = useState(false)
  const [sortBy, setSortBy] = useState<'recent' | 'commonTags' | 'mutual'>('mutual')
  const [inviteMessage, setInviteMessage] = useState('')
  const [selectedRole, setSelectedRole] = useState(requiredRole || 'development')

  useEffect(() => {
    if (open) {
      loadFollowing()
    }
  }, [open])

  useEffect(() => {
    filterAndSortUsers()
  }, [following, searchQuery, filterMutualFollow, filterAvailable, sortBy])

  const loadFollowing = async () => {
    try {
      setLoading(true)
      const data = await apiGet<{ following: User[] }>(`/users/${user?.id}/following`)
      // 맞팔 확인 및 공통 태그 계산
      const followingWithMetadata = await Promise.all(
        (data.following || []).map(async (u) => {
          try {
            const mutualCheck = await apiGet<{ isFollowing: boolean }>(`/users/${u.id}/follow-counts`)
            const userProfile = await apiGet<{ interests?: string[] }>(`/users/${u.id}/profile`)
            const currentUserProfile = await apiGet<{ interests?: string[] }>(`/users/${user?.id}/profile`)
            
            const commonTags = (userProfile.interests || []).filter((tag: string) =>
              (currentUserProfile.interests || []).includes(tag)
            )

            return {
              ...u,
              isMutualFollow: mutualCheck.isFollowing,
              commonTags: commonTags,
            }
          } catch {
            return { ...u, isMutualFollow: false, commonTags: [] }
          }
        })
      )
      setFollowing(followingWithMetadata)
    } catch (error) {
      console.error('팔로잉 목록 로드 실패:', error)
      setFollowing([])
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortUsers = () => {
    let filtered = [...following]

    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(query) ||
        u.nickname?.toLowerCase().includes(query) ||
        u.school?.toLowerCase().includes(query) ||
        u.major?.toLowerCase().includes(query)
      )
    }

    // 맞팔 필터
    if (filterMutualFollow) {
      filtered = filtered.filter(u => u.isMutualFollow)
    }

    // 협업 가능 필터
    if (filterAvailable) {
      filtered = filtered.filter(u => u.isAvailableForCollaboration)
    }

    // 정렬
    filtered.sort((a, b) => {
      if (sortBy === 'mutual') {
        if (a.isMutualFollow && !b.isMutualFollow) return -1
        if (!a.isMutualFollow && b.isMutualFollow) return 1
        return (b.commonTags?.length || 0) - (a.commonTags?.length || 0)
      } else if (sortBy === 'commonTags') {
        return (b.commonTags?.length || 0) - (a.commonTags?.length || 0)
      } else {
        // recent - 최근 활동 기준 (현재는 생성일 기준)
        return 0
      }
    })

    setFilteredUsers(filtered)
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleInvite = () => {
    if (selectedUsers.length === 0) {
      alert(isEnglish ? 'Please select at least one user' : '최소 한 명의 사용자를 선택해주세요')
      return
    }
    onInvite(selectedUsers, inviteMessage, selectedRole)
    setSelectedUsers([])
    setInviteMessage('')
    onClose()
  }

  const roles = [
    { value: 'planning', label: { ko: '기획', en: 'Planning' } },
    { value: 'development', label: { ko: '개발', en: 'Development' } },
    { value: 'frontend', label: { ko: '프론트엔드', en: 'Frontend' } },
    { value: 'backend', label: { ko: '백엔드', en: 'Backend' } },
    { value: 'ai', label: { ko: 'AI', en: 'AI' } },
    { value: 'design', label: { ko: '디자인', en: 'Design' } },
    { value: 'pm', label: { ko: 'PM', en: 'PM' } },
    { value: 'marketing', label: { ko: '마케팅', en: 'Marketing' } },
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEnglish ? 'Invite Team Members' : '팀원 초대하기'}
      style={{ maxWidth: 800 }}
    >
      <div style={{ display: 'grid', gap: 20 }}>
        {/* 필터 및 검색 */}
        <div style={{ display: 'grid', gap: 12 }}>
          <input
            className="input"
            placeholder={isEnglish ? 'Search by name, school, major...' : '이름, 학교, 전공으로 검색...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={filterMutualFollow}
                onChange={e => setFilterMutualFollow(e.target.checked)}
              />
              <span className="helper" style={{ fontSize: 13 }}>
                {isEnglish ? 'Mutual follow only' : '맞팔만 보기'}
              </span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={filterAvailable}
                onChange={e => setFilterAvailable(e.target.checked)}
              />
              <span className="helper" style={{ fontSize: 13 }}>
                {isEnglish ? 'Available for collaboration' : '협업 가능한 사람만'}
              </span>
            </label>
            <select
              className="input"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              style={{ fontSize: 13, padding: '6px 12px' }}
            >
              <option value="mutual">{isEnglish ? 'Mutual follow + Common tags' : '맞팔 + 공통 태그'}</option>
              <option value="commonTags">{isEnglish ? 'Common tags' : '공통 태그'}</option>
              <option value="recent">{isEnglish ? 'Recent activity' : '최근 활동'}</option>
            </select>
          </div>
        </div>

        {/* 역할 선택 */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
            {isEnglish ? 'Required Role' : '필요한 역할'}
          </label>
          <select className="input" value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
            {roles.map(r => (
              <option key={r.value} value={r.value}>
                {isEnglish ? r.label.en : r.label.ko}
              </option>
            ))}
          </select>
        </div>

        {/* 초대 메시지 템플릿 */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
            {isEnglish ? 'Invitation Message' : '초대 메시지'}
          </label>
          <textarea
            className="input"
            value={inviteMessage}
            onChange={e => setInviteMessage(e.target.value)}
            placeholder={isEnglish 
              ? 'Tell them about the project, timeline, expected hours per week, goals...'
              : '프로젝트 소개, 타임라인, 주당 예상 시간, 목표 등을 작성하세요...'}
            style={{ minHeight: 100, resize: 'vertical' }}
          />
        </div>

        {/* 사용자 목록 */}
        <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
          {loading ? (
            <div className="helper" style={{ textAlign: 'center', padding: 40 }}>
              {isEnglish ? 'Loading...' : '로딩 중...'}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="helper" style={{ textAlign: 'center', padding: 40 }}>
              {isEnglish ? 'No users found' : '사용자를 찾을 수 없습니다'}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {filteredUsers.map(u => (
                <label
                  key={u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    borderRadius: 8,
                    border: selectedUsers.includes(u.id)
                      ? '2px solid var(--brand)'
                      : '1px solid var(--border)',
                    background: selectedUsers.includes(u.id)
                      ? 'rgba(30, 111, 255, 0.1)'
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u.id)}
                    onChange={() => toggleUserSelection(u.id)}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <strong>{u.name}</strong>
                      {u.isMutualFollow && (
                        <span className="badge" style={{ fontSize: 11, background: 'rgba(30, 111, 255, 0.1)', color: 'var(--brand)' }}>
                          {isEnglish ? 'Mutual' : '맞팔'}
                        </span>
                      )}
                      {u.isAvailableForCollaboration && (
                        <span className="badge" style={{ fontSize: 11, background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50' }}>
                          {isEnglish ? 'Available' : '협업 가능'}
                        </span>
                      )}
                    </div>
                    <div className="helper" style={{ fontSize: 12 }}>
                      {u.school && u.major ? `${u.school} · ${u.major}` : u.school || u.major || ''}
                    </div>
                    {u.commonTags && u.commonTags.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                        {u.commonTags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="chip" style={{ fontSize: 10 }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 선택된 사용자 수 */}
        {selectedUsers.length > 0 && (
          <div className="helper" style={{ fontSize: 13 }}>
            {isEnglish 
              ? `${selectedUsers.length} user(s) selected`
              : `${selectedUsers.length}명 선택됨`}
          </div>
        )}

        {/* 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="badge" onClick={onClose}>
            {t('projects.cancel')}
          </button>
          <button
            className="button"
            onClick={handleInvite}
            disabled={selectedUsers.length === 0}
          >
            {isEnglish ? `Invite ${selectedUsers.length} User(s)` : `${selectedUsers.length}명 초대하기`}
          </button>
        </div>
      </div>
    </Modal>
  )
}
