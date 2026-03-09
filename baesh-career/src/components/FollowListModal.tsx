import Modal from './Modal'
import { useState, useEffect } from 'react'
import { apiGet } from '../utils/api'
import { useNavigate } from 'react-router-dom'

type User = {
  id: string
  name: string
  nickname?: string
  school?: string
  major?: string
  status?: string[]
}

interface FollowListModalProps {
  open: boolean
  onClose: () => void
  userId: string
  type: 'followers' | 'following'
}

export default function FollowListModal({ open, onClose, userId, type }: FollowListModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (open && userId) {
      loadUsers()
    }
  }, [open, userId, type])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await apiGet<{ followers?: User[], following?: User[] }>(
        `/users/${userId}/${type}`
      )
      if (type === 'followers') {
        setUsers(data.followers || [])
      } else {
        setUsers(data.following || [])
      }
    } catch (error) {
      console.error(`Failed to load ${type}:`, error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleUserClick = (user: User) => {
    onClose()
    navigate(`/profile/${user.id}`)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={type === 'followers' ? '팔로워' : '팔로잉'}
      style={{ maxWidth: 480 }}
    >
      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="helper" style={{ fontSize: 14 }}>로딩 중...</div>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="helper" style={{ fontSize: 14 }}>
              {type === 'followers' ? '팔로워가 없습니다.' : '팔로잉한 사용자가 없습니다.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {users.map((user) => {
              let desc = ''
              if (user.school && user.major) {
                desc = `${user.school} · ${user.major}`
              } else if (user.school) {
                desc = user.school
              } else if (user.major) {
                desc = user.major
              }
              if (user.status && user.status.length > 0) {
                desc = desc ? `${desc} · ${user.status[0]}` : user.status[0]
              }

              return (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    padding: 12,
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--panel-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1E6FFF, #408CFF)',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                      {user.name}
                    </div>
                    {desc && (
                      <div className="helper" style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {desc}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Modal>
  )
}

