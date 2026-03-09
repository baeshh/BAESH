import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { apiPost, apiGet } from '../utils/api'
import { useAuth } from '../auth/AuthContext'

type Comment = {
  author: string
  verified: boolean
  content: string
  timestamp: string
  replies?: Reply[]
}

type Reply = {
  author: string
  verified: boolean
  content: string
  timestamp: string
}

type Props = {
  id: string | number
  author: string
  authorId?: string
  verified?: boolean
  title: string
  content: string
  tags: string[]
  image?: string
  likes: number
  comments: number
  timestamp: string
  isLiked?: boolean
  isRecommended?: boolean
  interestMatchRate?: number
  exposureCount?: number
  exposureDomains?: Array<{ domain: string; count: number }>
  onLike?: () => void
  onComment?: () => void
  onShare?: () => void
  onDM?: () => void
  onProfileClick?: () => void
  onCommentProfileClick?: (author: string, authorId?: string) => void
  onEdit?: (postId: string | number) => void
  onDelete?: (postId: string | number) => void
  onHashtagClick?: (tag: string) => void
}

// 더미 댓글 생성 함수
const generateDummyComments = (count: number): Comment[] => {
  const commentTemplates = [
    { author: '김지후', verified: true, content: '정말 유익한 정보네요! 저도 비슷한 경험이 있어서 공감됩니다.', timestamp: '1시간 전' },
    { author: '박민수', verified: true, content: '대단하시네요! 혹시 더 자세한 내용 공유해주실 수 있나요?', timestamp: '2시간 전' },
    { author: '이수민', verified: false, content: '저도 이 분야에 관심이 많은데 많은 도움이 되었습니다. 감사합니다!', timestamp: '3시간 전' },
    { author: '최은지', verified: true, content: '와 정말 멋진 프로젝트네요! 응원합니다 👍', timestamp: '4시간 전' },
    { author: '정민호', verified: false, content: '실무에서 바로 적용해볼 수 있을 것 같아요. 좋은 인사이트 감사합니다.', timestamp: '5시간 전' },
    { author: '강서연', verified: true, content: '이런 접근 방식은 생각 못했는데 신선하네요!', timestamp: '6시간 전' },
    { author: '윤재훈', verified: false, content: '저도 비슷한 프로젝트 진행 중인데 참고가 많이 되었습니다.', timestamp: '7시간 전' },
    { author: '한지원', verified: true, content: '기술적으로 어떤 부분이 가장 어려우셨나요?', timestamp: '8시간 전' },
    { author: '오승현', verified: false, content: '다음 프로젝트도 기대하겠습니다!', timestamp: '9시간 전' },
    { author: '임채은', verified: true, content: '협업 기회가 있다면 연락 주세요!', timestamp: '10시간 전' },
  ]
  
  return commentTemplates.slice(0, Math.min(count, commentTemplates.length))
}

export default function PostCard({ id, author, authorId, verified, title, content, tags, image, likes, comments: initialCommentsCount, timestamp, isLiked, isRecommended, interestMatchRate, exposureCount, exposureDomains, onLike, onComment, onShare, onDM, onProfileClick, onCommentProfileClick, onEdit, onDelete, onHashtagClick }: Props) {
  const { t, i18n } = useTranslation()
  const { user: currentUser } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [savedComments, setSavedComments] = useState<Comment[]>([])
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  
  // 현재 사용자 확인 (authorId와 currentUser.id 비교)
  // authorId가 없으면 author 이름으로도 확인 (fallback)
  const isCurrentUser = authorId 
    ? String(authorId) === String(currentUser?.id)
    : author === currentUser?.name
  
  // 프로필 사진 가져오기 (작성자별로 분리)
  // 현재 사용자인 경우: 현재 사용자 ID로 저장된 프로필 사진
  // 다른 사용자인 경우: 해당 사용자 ID로 저장된 프로필 사진
  const profilePhoto = authorId 
    ? (isCurrentUser 
        ? localStorage.getItem(`baesh-profile-photo-${currentUser?.id}`)
        : localStorage.getItem(`baesh-profile-photo-${authorId}`))
    : (isCurrentUser 
        ? localStorage.getItem(`baesh-profile-photo-${currentUser?.id}`)
        : null)
  
  // 댓글 불러오기
  useEffect(() => {
    if (showComments) {
      loadComments()
    }
  }, [showComments])
  
  const loadComments = async () => {
    try {
      setLoadingComments(true)
      const data = await apiGet<{ comments: Array<{ id: string; author: string; authorId?: string; verified: boolean; content: string; timestamp: string }> }>(`/posts/${id}/comments`)
      setSavedComments(data.comments.map(c => ({
        author: c.author,
        authorId: c.authorId, // 댓글 작성자 ID 저장
        verified: c.verified,
        content: c.content,
        timestamp: formatTimestamp(c.timestamp),
        replies: []
      })))
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setLoadingComments(false)
    }
  }
  
  const formatTimestamp = (isoString: string): string => {
    const isEnglish = i18n.language === 'en'
    
    // 이미 "방금 전", "1시간 전" 등의 형식인 경우 그대로 반환
    if (!isoString || isoString.includes('전') || isoString.includes('ago')) {
      return isoString || t('common.justNow')
    }
    
    const date = new Date(isoString)
    
    // Invalid Date 체크
    if (isNaN(date.getTime())) {
      return t('common.justNow')
    }
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return t('common.justNow')
    if (diffMins < 60) return `${diffMins}${t('common.minutesAgo')}`
    if (diffHours < 24) return `${diffHours}${t('common.hoursAgo')}`
    if (diffDays < 7) return `${diffDays}${t('common.daysAgo')}`
    return date.toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR')
  }
  
  const allComments = savedComments

  const handleAddComment = async () => {
    if (!commentText.trim()) return
    
    try {
      const newCommentData = await apiPost<{
        id: string
        author: string
        authorId?: string
        verified: boolean
        content: string
        timestamp: string
        postCommentsCount: number
      }>(`/posts/${id}/comments`, {
        content: commentText.trim()
      })
      
      const newComment: Comment = {
        author: newCommentData.author,
        authorId: newCommentData.authorId,
        verified: newCommentData.verified,
        content: newCommentData.content,
        timestamp: formatTimestamp(newCommentData.timestamp),
        replies: []
      }
      
      // 댓글 목록 다시 불러오기 (최신 상태 유지)
      await loadComments()
      setCommentsCount(newCommentData.postCommentsCount)
      setCommentText('')
      onComment?.()
    } catch (error) {
      console.error('Failed to add comment:', error)
      alert(t('post.commentFailed'))
    }
  }

  const handleAddReply = (commentIndex: number) => {
    if (replyText.trim()) {
      const newReply: Reply = {
        author: '배승환',
        verified: true,
        content: replyText,
        timestamp: '방금 전'
      }
      
      const updatedComments = [...allComments]
      if (!updatedComments[commentIndex].replies) {
        updatedComments[commentIndex].replies = []
      }
      updatedComments[commentIndex].replies!.push(newReply)
      
      // Update userComments if it's a user comment
      if (commentIndex >= dummyComments.length) {
        const userCommentIndex = commentIndex - dummyComments.length
        const updatedUserComments = [...userComments]
        updatedUserComments[userCommentIndex] = updatedComments[commentIndex]
        setUserComments(updatedUserComments)
      } else {
        // For dummy comments, we need to add them to userComments
        const updatedDummyComment = { ...updatedComments[commentIndex] }
        setUserComments([...userComments, updatedDummyComment])
      }
      
      setReplyText('')
      setReplyingTo(null)
      onComment?.()
    }
  }

  const handleShare = () => {
    const shareUrl = `https://baesh.career/post/${Date.now()}`
    if (navigator.share) {
      navigator.share({
        title: title,
        text: content,
        url: shareUrl
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareUrl)
        alert('링크가 클립보드에 복사되었습니다!')
      })
    } else {
      navigator.clipboard.writeText(shareUrl)
      alert('링크가 클립보드에 복사되었습니다!\n\n' + shareUrl)
    }
    onShare?.()
  }

  return (
    <div className="panel" style={{ padding: 16, marginBottom: 12, background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 12 }}>
      {/* Recommended Badge */}
      {isRecommended && interestMatchRate !== undefined && (
        <div style={{ marginBottom: 10, padding: '6px 12px', background: 'rgba(30,111,255,0.08)', borderRadius: 8, display: 'inline-block' }}>
          <span style={{ fontSize: 11, color: 'var(--brand)', fontWeight: 600 }}>✨ {t('networking.aiRecommended')} · {t('networking.interestMatch', { rate: interestMatchRate })}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer' }} onClick={onProfileClick}>
        <div 
          style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 999, 
            background: profilePhoto 
              ? 'transparent' 
              : 'linear-gradient(135deg, #1E6FFF, #408CFF)',
            overflow: 'hidden',
            flexShrink: 0
          }}
        >
          {profilePhoto ? (
            <img 
              src={profilePhoto} 
              alt={author}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <strong style={{ fontSize: 14 }}>{author}</strong>
          </div>
          <div className="helper" style={{ fontSize: 11 }}>{formatTimestamp(timestamp)}</div>
        </div>
      </div>

      {/* Content - 인스타그램 스타일 (제목 없이 내용만) */}
      <p style={{ fontSize: 14, lineHeight: 1.7, margin: '0 0 12px 0', color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{content}</p>

      {/* Tags - 최대 2개만 표시, 클릭 가능 */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {tags.slice(0, 2).map(tag => (
            <span 
              key={tag} 
              className="chip" 
              onClick={() => onHashtagClick?.(tag)}
              style={{ 
                fontSize: 11, 
                padding: '2px 8px', 
                height: 'auto', 
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: onHashtagClick ? 'rgba(30,111,255,0.1)' : undefined,
                color: onHashtagClick ? 'var(--brand)' : undefined,
                borderColor: onHashtagClick ? 'rgba(30,111,255,0.3)' : undefined
              }}
              onMouseEnter={(e) => {
                if (onHashtagClick) {
                  e.currentTarget.style.background = 'rgba(30,111,255,0.15)'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }
              }}
              onMouseLeave={(e) => {
                if (onHashtagClick) {
                  e.currentTarget.style.background = 'rgba(30,111,255,0.1)'
                  e.currentTarget.style.transform = 'scale(1)'
                }
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Image */}
      {image && (
        <div style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden', background: '#F5F6F8', height: 200, display: 'grid', placeItems: 'center' }}>
          <span className="helper">📷 이미지 영역</span>
        </div>
      )}

      {/* AI Insight */}
      {exposureCount !== undefined && exposureCount > 0 && exposureDomains && exposureDomains.length > 0 && (
        <div className="panel" style={{ padding: 10, marginTop: 12, background: 'rgba(30,111,255,0.05)', border: '1px solid rgba(30,111,255,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12 }}>🧠</span>
            <span className="helper" style={{ fontSize: 11, color: 'var(--brand)' }}>
              {t('networking.exposedInNetwork', { domains: exposureDomains.map(d => d.domain).join('/'), count: exposureCount })}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', alignItems: 'center', flexWrap: 'wrap' }}>
        <button 
          className="badge" 
          onClick={onLike} 
          style={{ 
            fontSize: 12, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 4,
            background: isLiked ? 'rgba(255,59,48,0.1)' : undefined,
            color: isLiked ? '#FF3B30' : undefined,
            borderColor: isLiked ? '#FF3B30' : undefined
          }}
        >
          {isLiked ? '❤️' : '🤍'} {likes}
        </button>
        <button 
          className="badge" 
          onClick={() => setShowComments(!showComments)} 
          style={{ 
            fontSize: 12, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 4,
            background: showComments ? 'rgba(30,111,255,0.1)' : undefined,
            color: showComments ? 'var(--brand)' : undefined
          }}
        >
          💬 {commentsCount}
        </button>
        <button className="badge" onClick={handleShare} style={{ fontSize: 12 }}>
          🔗 {t('common.share')}
        </button>
        <button className="button" onClick={onDM} style={{ fontSize: 12, height: 32 }}>
          📩 {t('common.sendDM')}
        </button>
        {/* 수정/삭제 버튼 (작성자만 표시) */}
        {isCurrentUser && (
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
            <button 
              className="badge" 
              onClick={() => onEdit?.(id)}
              style={{ 
                fontSize: 11, 
                height: 28,
                padding: '0 10px',
                background: 'rgba(30, 111, 255, 0.1)',
                color: 'var(--brand)',
                border: '1px solid rgba(30, 111, 255, 0.2)'
              }}
            >
              ✏ {t('post.edit')}
            </button>
            <button 
              className="badge" 
              onClick={() => {
                if (confirm(t('post.confirmDelete'))) {
                  onDelete?.(id)
                }
              }}
              style={{ 
                fontSize: 11, 
                height: 28,
                padding: '0 10px',
                background: 'rgba(255, 59, 48, 0.1)',
                color: '#FF3B30',
                border: '1px solid rgba(255, 59, 48, 0.2)'
              }}
            >
              🗑 {t('post.delete')}
            </button>
          </div>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          {loadingComments ? (
            <div className="helper" style={{ textAlign: 'center', padding: 20 }}>{t('post.loadingComments')}</div>
          ) : (
            <>
              <div style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
                {allComments.length === 0 && (
                  <div className="helper" style={{ textAlign: 'center', padding: 20 }}>{t('post.noComments')}</div>
                )}
                {allComments.map((comment, idx) => {
              const isCommentAuthorCurrentUser = comment.authorId === currentUser?.id
              const commentAuthorPhoto = comment.authorId
                ? (isCommentAuthorCurrentUser 
                    ? localStorage.getItem(`baesh-profile-photo-${currentUser?.id}`)
                    : localStorage.getItem(`baesh-profile-photo-${comment.authorId}`))
                : null
              
              return (
              <div key={idx} style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div 
                    style={{ 
                      width: 28, 
                      height: 28, 
                      borderRadius: 999, 
                      background: commentAuthorPhoto 
                        ? 'transparent' 
                        : 'linear-gradient(135deg, #1E6FFF, #408CFF)', 
                      flexShrink: 0, 
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                    onClick={() => onCommentProfileClick?.(comment.author)}
                  >
                    {commentAuthorPhoto ? (
                      <img 
                        src={commentAuthorPhoto} 
                        alt={comment.author}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12 }}>
                        👤
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <strong 
                        style={{ fontSize: 12, cursor: 'pointer' }}
                        onClick={() => onCommentProfileClick?.(comment.author, comment.authorId)}
                      >
                        {comment.author}
                      </strong>
                      <span className="helper" style={{ fontSize: 10 }}>{comment.timestamp}</span>
                    </div>
                    <p style={{ fontSize: 13, margin: '4px 0 0 0', lineHeight: 1.5 }}>{comment.content}</p>
                    <button 
                      className="badge" 
                      onClick={() => setReplyingTo(replyingTo === idx ? null : idx)}
                      style={{ fontSize: 11, marginTop: 4, padding: '2px 8px', height: 'auto' }}
                    >
                      💬 {t('post.reply')}
                    </button>
                  </div>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div style={{ marginLeft: 38, display: 'grid', gap: 8 }}>
                    {comment.replies.map((reply, replyIdx) => {
                      const isReplyAuthorCurrentUser = (reply as any).authorId === currentUser?.id
                      const replyAuthorPhoto = (reply as any).authorId
                        ? (isReplyAuthorCurrentUser 
                            ? localStorage.getItem(`baesh-profile-photo-${currentUser?.id}`)
                            : localStorage.getItem(`baesh-profile-photo-${(reply as any).authorId}`))
                        : null
                      
                      return (
                      <div key={replyIdx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <div 
                          style={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: 999, 
                            background: replyAuthorPhoto 
                              ? 'transparent' 
                              : 'linear-gradient(135deg, #1E6FFF, #408CFF)', 
                            flexShrink: 0, 
                            cursor: 'pointer',
                            overflow: 'hidden'
                          }}
                          onClick={() => onCommentProfileClick?.(reply.author, (reply as any).authorId)}
                        >
                          {replyAuthorPhoto ? (
                            <img 
                              src={replyAuthorPhoto} 
                              alt={reply.author}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover' 
                              }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10 }}>
                              👤
                            </div>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <strong 
                              style={{ fontSize: 11, cursor: 'pointer' }}
                              onClick={() => onCommentProfileClick?.(reply.author, (reply as any).authorId)}
                            >
                              {reply.author}
                            </strong>
                            <span className="helper" style={{ fontSize: 9 }}>{reply.timestamp}</span>
                          </div>
                          <p style={{ fontSize: 12, margin: '2px 0 0 0', lineHeight: 1.5 }}>{reply.content}</p>
                        </div>
                      </div>
                      )
                    })}
                  </div>
                )}

                {/* Reply Input */}
                {replyingTo === idx && (
                  <div style={{ marginLeft: 38, display: 'flex', gap: 8 }}>
                    <input 
                      className="input" 
                      placeholder={t('post.replyTo', { author: comment.author })}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleAddReply(idx)}
                      style={{ flex: 1, height: 32, fontSize: 12 }}
                      autoFocus
                    />
                    <button 
                      className="button" 
                      onClick={() => handleAddReply(idx)}
                      disabled={!replyText.trim()}
                      style={{ height: 32, padding: '0 12px', fontSize: 11 }}
                    >
                      {t('post.postingBtn')}
                    </button>
                    <button 
                      className="badge" 
                      onClick={() => { setReplyingTo(null); setReplyText('') }}
                      style={{ height: 32, padding: '0 12px', fontSize: 11 }}
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                )}
              </div>
              )
            })}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input 
                  className="input" 
                  placeholder={t('post.addComment')} 
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddComment()}
                  style={{ flex: 1, height: 36, fontSize: 13 }}
                />
                <button 
                  className="button" 
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  style={{ height: 36, padding: '0 16px', fontSize: 12 }}
                >
                  {t('post.postingBtn')}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

