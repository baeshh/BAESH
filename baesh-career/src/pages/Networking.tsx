import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import PostCard from '../components/PostCard'
import UserProfileModal from '../components/UserProfileModal'
import DMModal from '../components/DMModal'
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api'
import { useAuth } from '../auth/AuthContext'
import Modal from '../components/Modal'

type Post = {
  id: number
  author: string
  authorId?: string
  verified: boolean
  title: string
  content: string
  tags: string[]
  image?: string
  likes: number
  comments: number
  timestamp: string
  isLiked?: boolean
  isRecommended?: boolean
  isFollowing?: boolean
  interestMatchRate?: number
  exposureCount?: number
  exposureDomains?: Array<{ domain: string; count: number }>
}

type RecommendedUser = {
  id: string
  name: string
  nickname?: string
  school?: string
  major?: string
  status?: string[]
  interests?: string[]
  desc?: string
  initialFollowed?: boolean
  matchScore?: number
  title?: string
  company?: string
}

const mockPosts: Post[] = [
  { id: 1, author: 'SeungHwan Bae', verified: true, title: 'Building BAESH: AI-Powered Career Platform', content: 'Just completed Pohang TP certification! Preparing for a new project. Looking to network with people interested in AI and data-driven startups.', tags: ['AI', 'Startup', 'Data'], likes: 24, comments: 8, timestamp: '2 hours ago', isLiked: true, isRecommended: false },
  { id: 2, author: 'JiHu Kim', verified: true, title: 'Meta Llama Hackathon Experience', content: 'Won first place at this hackathon! Sharing the process of developing an AI-based solution.', tags: ['Hackathon', 'AI', 'Winner'], likes: 42, comments: 15, timestamp: '5 hours ago', isLiked: false, isRecommended: false },
  { id: 3, author: 'SuMin Lee', verified: false, title: 'Completed Pohang TP AI Advanced Course', content: 'Finished 3 months of AI advanced course. The hands-on project experience was really valuable!', tags: ['AI', 'Education', 'Completion'], likes: 18, comments: 6, timestamp: '1 day ago', isLiked: false, isRecommended: true },
  { id: 4, author: 'MinSu Park', verified: true, title: 'Sharing Data Engineering Experience', content: 'Worked on building an AWS-based data pipeline project. Sharing the problems I encountered and how I solved them.', tags: ['Data', 'AWS', 'Engineering'], likes: 31, comments: 12, timestamp: '1 day ago', isLiked: false, isRecommended: true },
]

export default function Networking() {
  const { t, i18n } = useTranslation()
  const isEnglish = i18n.language === 'en'
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [dmOpen, setDmOpen] = useState(false)
  const [recommendedUsers, setRecommendedUsers] = useState<RecommendedUser[]>([])
  const [topMatches, setTopMatches] = useState<RecommendedUser[]>([])
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set())
  const [trendingHashtags, setTrendingHashtags] = useState<{ tag: string; count: number }[]>([])
  const [hashtagPeriod, setHashtagPeriod] = useState('24 hours')
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editPost, setEditPost] = useState<Post | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editTags, setEditTags] = useState<string[]>([])
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)
  const [postContent, setPostContent] = useState('')

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Load Font Awesome and Google Fonts
  useEffect(() => {
    const linkFA = document.createElement('link')
    linkFA.rel = 'stylesheet'
    linkFA.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
    document.head.appendChild(linkFA)

    const linkFonts = document.createElement('link')
    linkFonts.rel = 'stylesheet'
    linkFonts.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@700;800&display=swap'
    document.head.appendChild(linkFonts)

    return () => {
      document.head.removeChild(linkFA)
      document.head.removeChild(linkFonts)
    }
  }, [])

  // Load posts and recommended users
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await apiGet<{ posts: any[] }>('/posts?type=networking')
        const rawPosts = data?.posts ?? []
        if (rawPosts.length === 0) {
          setPosts(mockPosts)
          setLoading(false)
          return
        }
        const postsData = rawPosts.map((p: any) => ({
          id: p.id,
          author: p.author,
          authorId: p.authorId,
          verified: p.verified || false,
          title: p.title,
          content: p.content,
          tags: Array.isArray(p.tags) ? p.tags : [],
          likes: p.likes || 0,
          comments: p.comments || 0,
          timestamp: p.timestamp,
          isLiked: p.isLiked || false,
          isRecommended: p.isRecommended || false,
          isFollowing: p.isFollowing || false,
          interestMatchRate: p.interestMatchRate,
          exposureCount: p.exposureCount,
          exposureDomains: p.exposureDomains,
        }))
        
        postsData.sort((a, b) => {
          const dateA = new Date(a.timestamp).getTime()
          const dateB = new Date(b.timestamp).getTime()
          return dateB - dateA
        })
        
        setPosts(postsData)
      } catch (error) {
        console.error('Failed to load posts:', error)
        setPosts(mockPosts)
      } finally {
        setLoading(false)
      }
    }
    
    const loadRecommendedUsers = async () => {
      try {
        const data = await apiGet<{ users: RecommendedUser[] }>('/users?limit=10&excludeCurrent=true')
        const usersWithDesc = data.users.map(user => {
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
          return {
            ...user,
            desc: desc || 'BAESH User',
            matchScore: Math.floor(Math.random() * 20) + 75 // 75-95% match score
          }
        })
        
        // Top Matches are top 3 users
        setTopMatches(usersWithDesc.slice(0, 3))
        setRecommendedUsers(usersWithDesc.slice(3))
        
        const followStatusPromises = usersWithDesc.map(async (user) => {
          try {
            const status = await apiGet<{ isFollowing: boolean }>(`/users/${user.id}/follow-status`)
            return { userId: user.id, isFollowing: status.isFollowing }
          } catch {
            return { userId: user.id, isFollowing: false }
          }
        })
        const followStatuses = await Promise.all(followStatusPromises)
        const followingSet = new Set(
          followStatuses.filter(s => s.isFollowing).map(s => s.userId)
        )
        setFollowingUsers(followingSet)
      } catch (error) {
        console.error('Failed to load recommended users:', error)
        setTopMatches([])
        setRecommendedUsers([])
      }
    }
    
    const loadTrendingHashtags = async () => {
      try {
        const data = await apiGet<{ hashtags: { tag: string; count: number }[]; period: string }>(
          '/posts/trending-hashtags?hours=1&limit=5&type=networking'
        )
        setTrendingHashtags(data.hashtags)
        setHashtagPeriod(data.period)
      } catch (error) {
        console.error('Failed to load trending hashtags:', error)
        setTrendingHashtags([
          { tag: 'GenerativeAI', count: 124 },
          { tag: 'Web3', count: 89 },
          { tag: 'StartupLife', count: 67 },
          { tag: 'RemoteWork', count: 45 }
        ])
      }
    }
    
    loadPosts()
    loadRecommendedUsers()
    loadTrendingHashtags()
    
    const hashtagInterval = setInterval(() => {
      loadTrendingHashtags()
    }, 5 * 60 * 1000)
    
    return () => {
      clearInterval(hashtagInterval)
    }
  }, [])

  const handleLike = async (postId: number) => {
    try {
      const response = await apiPost<{ likes: number; isLiked: boolean }>(`/posts/${postId}/like`, {})
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return { ...p, isLiked: response.isLiked, likes: response.likes }
        }
        return p
      }))
    } catch (error) {
      console.error('Failed to like post:', error)
      alert('Failed to like post.')
    }
  }

  const handlePost = async (data: any) => {
    try {
      const newPost = await apiPost<Post>('/posts', {
        title: '',
        content: data.content,
        tags: data.tags,
        type: 'networking',
      })
      setPosts([newPost, ...posts])
      
      setTimeout(async () => {
        try {
          const data = await apiGet<{ posts: any[] }>('/posts?type=networking')
          const postsData = data.posts.map((p: any) => ({
            id: p.id,
            author: p.author,
            authorId: p.authorId,
            verified: p.verified || false,
            title: p.title,
            content: p.content,
            tags: Array.isArray(p.tags) ? p.tags : [],
            likes: p.likes || 0,
            comments: p.comments || 0,
            timestamp: p.timestamp,
            isLiked: p.isLiked || false,
            isRecommended: p.isRecommended || false,
            isFollowing: p.isFollowing || false,
            interestMatchRate: p.interestMatchRate,
            exposureCount: p.exposureCount,
            exposureDomains: p.exposureDomains,
          }))
          postsData.sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime()
            const dateB = new Date(b.timestamp).getTime()
            return dateB - dateA
          })
          setPosts(postsData)
        } catch (error) {
          console.error('Failed to refresh posts:', error)
        }
      }, 500)
    } catch (error) {
      console.error('Failed to create post:', error)
      const localPost: Post = {
        id: posts.length + 1,
        author: currentUser?.name || 'User',
        authorId: currentUser?.id,
        verified: true,
        title: '',
        content: data.content,
        tags: data.tags,
        likes: 0,
        comments: 0,
        timestamp: new Date().toISOString(),
        isLiked: false,
        isRecommended: false
      }
      const updatedPosts = [localPost, ...posts].sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime()
        const dateB = new Date(b.timestamp).getTime()
        return dateB - dateA
      })
      setPosts(updatedPosts)
    }
  }

  const handleEditPost = (postId: string | number) => {
    const post = posts.find(p => p.id === postId)
    if (post) {
      setEditPost(post)
      setEditContent(post.content)
      setEditTags(post.tags)
    }
  }

  const handleUpdatePost = async () => {
    if (!editPost) return
    
    try {
      const updatedPost = await apiPut<Post>(`/posts/${editPost.id}`, {
        title: '',
        content: editContent,
        tags: editTags,
      })
      setPosts(posts.map(p => p.id === editPost.id ? updatedPost : p))
      setEditPost(null)
      setEditContent('')
      setEditTags([])
    } catch (error) {
      console.error('Failed to update post:', error)
      alert(t('post.updateFailed'))
    }
  }

  const handleDeletePost = async (postId: string | number) => {
    try {
      await apiDelete(`/posts/${postId}`)
      setPosts(posts.filter(p => p.id !== postId))
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert(t('post.deleteFailed'))
    }
  }

  const handleProfileClick = (author: string, authorId?: string) => {
    setSelectedUser({ name: author, id: authorId })
    setProfileOpen(true)
  }

  const handleDM = () => {
    setDmOpen(true)
  }

  const handleDMFromProfile = () => {
    setProfileOpen(false)
    setDmOpen(true)
  }

  const handleFollow = async (userId: string) => {
    const isCurrentlyFollowing = followingUsers.has(userId)
    try {
      if (isCurrentlyFollowing) {
        await apiDelete(`/users/${userId}/follow`)
        setFollowingUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(userId)
          return newSet
        })
      } else {
        await apiPost(`/users/${userId}/follow`, {})
        setFollowingUsers(prev => {
          const newSet = new Set(prev)
          newSet.add(userId)
          return newSet
        })
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error)
      alert(t('post.followFailed'))
    }
  }

  const filteredPosts = selectedHashtag
    ? posts.filter(post => post.tags.some(tag => tag.toLowerCase() === selectedHashtag.toLowerCase()))
    : posts

  const userProfilePhoto = currentUser?.id 
    ? localStorage.getItem(`baesh-profile-photo-${currentUser.id}`)
    : null

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      fontFamily: "'Inter', sans-serif",
      color: '#1E293B'
    }}>
      {/* Main Content */}
      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '2rem 1rem',
        width: '100%'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(12, 1fr)' : '1fr',
          gap: '2rem'
        }}>
          {/* Left Sidebar */}
          {isDesktop && (
            <aside style={{
              gridColumn: 'span 3',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              position: 'sticky',
              top: '6rem',
              height: 'fit-content'
            }}>
              {/* User Profile Card */}
              <div style={{
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '1rem',
                padding: '1.5rem',
                textAlign: 'center',
                position: 'relative',
                transition: 'all 0.3s',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)'
              }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto',
                  borderRadius: '50%',
                  padding: '4px',
                  background: 'linear-gradient(to bottom right, #60A5FA, #A855F7)'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'white',
                    overflow: 'hidden'
                  }}>
                    {userProfilePhoto ? (
                      <img 
                        src={userProfilePhoto} 
                        alt={currentUser?.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name || 'User'}`}
                        alt={currentUser?.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                </div>
                <h3 style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  marginTop: '0.75rem',
                  marginBottom: 0,
                  color: '#0F172A'
                }}>
                  {currentUser?.name || 'User'}
                </h3>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#64748B',
                  marginTop: '0.25rem',
                  marginBottom: '1rem'
                }}>
                  AI Engineer @ London
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '1rem'
                }}>
                  <div>
                    <span style={{ display: 'block', color: '#0F172A' }}>1.2k</span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Connections</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: '#0F172A' }}>48</span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Projects</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault() }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    background: 'white',
                    color: '#2563EB',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #F1F5F9'
                  }}
                >
                  <i className="fa-solid fa-earth-americas"></i> Global Feed
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault() }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    color: '#475569',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <i className="fa-solid fa-user-group"></i> My Connections
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); navigate('/projects') }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    color: '#475569',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <i className="fa-solid fa-briefcase"></i> Project Requests
                  <span style={{
                    marginLeft: 'auto',
                    background: '#DBEAFE',
                    color: '#2563EB',
                    fontSize: '10px',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '9999px',
                    fontWeight: 600
                  }}>3</span>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault() }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    color: '#475569',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <i className="fa-solid fa-bookmark"></i> Saved Posts
                </a>
              </nav>

              {/* Trending Tags */}
              <div style={{ padding: '0 1rem' }}>
                <h4 style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.75rem'
                }}>
                  Trending Now
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {trendingHashtags.slice(0, 4).map(({ tag }) => (
                    <span
                      key={tag}
                      onClick={() => {
                        setSelectedHashtag(tag)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: '#F1F5F9',
                        color: '#475569',
                        fontSize: '0.75rem',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#E2E8F0'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#F1F5F9'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* Center Feed */}
          <div style={{
            gridColumn: isDesktop ? 'span 6' : 'span 1',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {/* Post Composer */}
            <div style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '1rem',
              padding: '1rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0, 0, 0, 0.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)'
            }}
            >
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#F1F5F9',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  {userProfilePhoto ? (
                    <img 
                      src={userProfilePhoto} 
                      alt={currentUser?.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name || 'User'}`}
                      alt={currentUser?.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Share your insight or start a project..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && postContent.trim()) {
                        handlePost({ content: postContent, tags: [] })
                        setPostContent('')
                      }
                    }}
                    style={{
                      width: '100%',
                      background: '#F8FAFC',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.625rem 1rem',
                      fontSize: '0.875rem',
                      color: '#1E293B',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.background = '#F1F5F9'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.background = '#F8FAFC'
                    }}
                    onMouseEnter={(e) => {
                      if (document.activeElement !== e.currentTarget) {
                        e.currentTarget.style.background = '#F1F5F9'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (document.activeElement !== e.currentTarget) {
                        e.currentTarget.style.background = '#F8FAFC'
                      }
                    }}
                  />
                </div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid #F1F5F9'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#475569',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F8FAFC'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                  >
                    <i className="fa-regular fa-image" style={{ color: '#3B82F6' }}></i> Media
                  </button>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#475569',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F8FAFC'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                  onClick={() => navigate('/projects')}
                  >
                    <i className="fa-solid fa-briefcase" style={{ color: '#A855F7' }}></i> Project
                  </button>
                </div>
                <button 
                  onClick={() => {
                    if (postContent.trim()) {
                      handlePost({ content: postContent, tags: [] })
                      setPostContent('')
                    }
                  }}
                  disabled={!postContent.trim()}
                  style={{
                    background: postContent.trim() ? '#0F172A' : '#CBD5E1',
                    color: 'white',
                    padding: '0.375rem 1.25rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: postContent.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (postContent.trim()) {
                      e.currentTarget.style.background = '#1E293B'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (postContent.trim()) {
                      e.currentTarget.style.background = '#0F172A'
                    }
                  }}
                >
                  Post
                </button>
              </div>
            </div>

            {/* Top Matches */}
            {topMatches.length > 0 && (
              <div style={{ position: 'relative' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginBottom: '0.75rem',
                  padding: '0 0.25rem'
                }}>
                  <h3 style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 700,
                    color: '#0F172A',
                    margin: 0
                  }}>
                    Top Matches for You
                  </h3>
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault() }}
                    style={{
                      fontSize: '0.75rem',
                      color: '#2563EB',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    See All
                  </a>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  overflowX: 'auto',
                  paddingBottom: '1rem',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}>
                  {topMatches.map((user) => {
                    const profilePhoto = user.id
                      ? localStorage.getItem(`baesh-profile-photo-${user.id}`)
                      : null
                    const matchScore = user.matchScore || 85
                    
                    return (
                      <div
                        key={user.id}
                        style={{
                          minWidth: '200px',
                          background: 'white',
                          border: '1px solid #E2E8F0',
                          borderRadius: '1rem',
                          padding: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0, 0, 0, 0.05)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)'
                        }}
                        onClick={() => handleProfileClick(user.name, user.id)}
                      >
                        {/* Match Score Ring */}
                        <div style={{
                          position: 'absolute',
                          top: '0.75rem',
                          right: '0.75rem',
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: `conic-gradient(#3B82F6 ${matchScore}%, #E2E8F0 0)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative'
                        }}>
                          <div style={{
                            position: 'absolute',
                            width: '32px',
                            height: '32px',
                            background: 'white',
                            borderRadius: '50%'
                          }}></div>
                          <span style={{
                            position: 'relative',
                            zIndex: 10,
                            fontSize: '10px',
                            fontWeight: 800,
                            color: '#2563EB'
                          }}>
                            {matchScore}%
                          </span>
                        </div>
                        
                        <div style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          background: '#FCE7F3',
                          marginBottom: '0.75rem',
                          overflow: 'hidden'
                        }}>
                          {profilePhoto ? (
                            <img 
                              src={profilePhoto} 
                              alt={user.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <img 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                              alt={user.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )}
                        </div>
                        <h4 style={{
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: '#0F172A',
                          margin: 0,
                          marginBottom: '0.25rem'
                        }}>
                          {user.name}
                        </h4>
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#64748B',
                          margin: 0,
                          marginBottom: '0.75rem',
                          textAlign: 'center'
                        }}>
                          {user.title || user.desc || 'BAESH User'}
                        </p>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'center',
                          gap: '0.25rem',
                          marginBottom: '0.75rem'
                        }}>
                          {user.interests?.slice(0, 2).map((interest, i) => {
                            const colors = [
                              { bg: '#DBEAFE', text: '#2563EB' },
                              { bg: '#F3E8FF', text: '#9333EA' },
                              { bg: '#FED7AA', text: '#9A3412' },
                              { bg: '#CCFBF1', text: '#134E4A' }
                            ]
                            const color = colors[i % colors.length]
                            return (
                              <span
                                key={i}
                                style={{
                                  fontSize: '10px',
                                  padding: '0.125rem 0.375rem',
                                  background: color.bg,
                                  color: color.text,
                                  borderRadius: '0.25rem'
                                }}
                              >
                                {interest}
                              </span>
                            )
                          })}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFollow(user.id)
                          }}
                          style={{
                            width: '100%',
                            padding: '0.375rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #2563EB',
                            color: '#2563EB',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#2563EB'
                            e.currentTarget.style.color = 'white'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white'
                            e.currentTarget.style.color = '#2563EB'
                          }}
                        >
                          {followingUsers.has(user.id) ? 'Connected' : 'Connect'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Posts Feed */}
            {selectedHashtag && (
              <div style={{
                padding: '0.75rem',
                marginBottom: '1rem',
                background: 'rgba(37, 99, 235, 0.05)',
                border: '1px solid rgba(37, 99, 235, 0.2)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2563EB' }}>
                    #{selectedHashtag}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {filteredPosts.length} posts
                  </span>
                </div>
                <button
                  onClick={() => setSelectedHashtag(null)}
                  style={{
                    fontSize: '0.75rem',
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: '#2563EB',
                    border: '1px solid rgba(37, 99, 235, 0.2)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  ✕ Clear
                </button>
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B' }}>
                Loading posts...
              </div>
            ) : filteredPosts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B' }}>
                No posts yet
              </div>
            ) : (
              filteredPosts.map(post => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  author={post.author}
                  authorId={post.authorId}
                  verified={post.verified}
                  title={post.title}
                  content={post.content}
                  tags={post.tags}
                  image={post.image}
                  likes={post.likes}
                  comments={post.comments}
                  timestamp={post.timestamp}
                  isLiked={post.isLiked}
                  isRecommended={post.isRecommended}
                  interestMatchRate={post.interestMatchRate}
                  exposureCount={post.exposureCount}
                  exposureDomains={post.exposureDomains}
                  onLike={() => handleLike(post.id)}
                  onComment={() => console.log('comment', post.id)}
                  onShare={() => console.log('share', post.id)}
                  onDM={handleDM}
                  onProfileClick={() => handleProfileClick(post.author, post.authorId)}
                  onCommentProfileClick={(author, authorId) => handleProfileClick(author, authorId)}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                  onHashtagClick={(tag) => {
                    setSelectedHashtag(tag)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                />
              ))
            )}
          </div>

          {/* Right Sidebar */}
          {isDesktop && (
            <aside style={{
              gridColumn: 'span 3',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              position: 'sticky',
              top: '6rem',
              height: 'fit-content'
            }}>
              {/* AI Insight Card */}
              <div style={{
                background: 'linear-gradient(to bottom right, #0F172A, #1E293B)',
                color: 'white',
                border: 'none',
                borderRadius: '1rem',
                padding: '1.25rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '96px',
                  height: '96px',
                  background: '#3B82F6',
                  borderRadius: '50%',
                  filter: 'blur(48px)',
                  opacity: 0.2,
                  transform: 'translate(40px, -40px)'
                }}></div>
                <div style={{ position: 'relative', zIndex: 10 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem'
                  }}>
                    <i className="fa-solid fa-wand-magic-sparkles" style={{ color: '#A855F7' }}></i>
                    <h4 style={{
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      margin: 0
                    }}>
                      BAESH AI Insight
                    </h4>
                  </div>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#CBD5E1',
                    lineHeight: 1.6,
                    marginBottom: '0.75rem',
                    margin: 0
                  }}>
                    Based on your recent activity, you seem interested in DeFi. There are 5 new projects recruiting in London this week.
                  </p>
                  <button style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  }}
                  onClick={() => navigate('/projects')}
                  >
                    View Projects
                  </button>
                </div>
              </div>

              {/* Recommended Jobs */}
              <div style={{
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '1rem',
                padding: '1.25rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)'
              }}>
                <h4 style={{
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: '#0F172A',
                  marginBottom: '1rem',
                  margin: 0
                }}>
                  Recommended for You
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    const title = e.currentTarget.querySelector('h5') as HTMLElement
                    if (title) title.style.color = '#2563EB'
                  }}
                  onMouseLeave={(e) => {
                    const title = e.currentTarget.querySelector('h5') as HTMLElement
                    if (title) title.style.color = '#0F172A'
                  }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '0.5rem',
                      background: '#DBEAFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563EB',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      flexShrink: 0
                    }}>
                      M
                    </div>
                    <div>
                      <h5 style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: '#0F172A',
                        margin: 0,
                        marginBottom: '0.25rem',
                        transition: 'color 0.2s'
                      }}>
                        Meta
                      </h5>
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#64748B',
                        margin: 0,
                        marginBottom: '0.125rem'
                      }}>
                        AI Research Intern
                      </p>
                      <p style={{
                        fontSize: '10px',
                        color: '#94A3B8',
                        margin: 0,
                        marginTop: '0.25rem'
                      }}>
                        London • Hybrid
                      </p>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    const title = e.currentTarget.querySelector('h5') as HTMLElement
                    if (title) title.style.color = '#2563EB'
                  }}
                  onMouseLeave={(e) => {
                    const title = e.currentTarget.querySelector('h5') as HTMLElement
                    if (title) title.style.color = '#0F172A'
                  }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '0.5rem',
                      background: '#D1FAE5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#059669',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      flexShrink: 0
                    }}>
                      N
                    </div>
                    <div>
                      <h5 style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: '#0F172A',
                        margin: 0,
                        marginBottom: '0.25rem',
                        transition: 'color 0.2s'
                      }}>
                        Naver
                      </h5>
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#64748B',
                        margin: 0,
                        marginBottom: '0.125rem'
                      }}>
                        Frontend Developer
                      </p>
                      <p style={{
                        fontSize: '10px',
                        color: '#94A3B8',
                        margin: 0,
                        marginTop: '0.25rem'
                      }}>
                        Seoul • On-site
                      </p>
                    </div>
                  </div>
                </div>
                <button style={{
                  width: '100%',
                  marginTop: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#475569',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#0F172A'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#475569'
                }}
                onClick={() => navigate('/lounge')}
                >
                  View all jobs <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>

              {/* Footer Links */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '0 0.5rem'
              }}>
                <a href="#" style={{
                  fontSize: '11px',
                  color: '#94A3B8',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  About
                </a>
                <a href="#" style={{
                  fontSize: '11px',
                  color: '#94A3B8',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Accessibility
                </a>
                <a href="#" style={{
                  fontSize: '11px',
                  color: '#94A3B8',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Help Center
                </a>
                <span style={{
                  fontSize: '11px',
                  color: '#CBD5E1'
                }}>
                  BAESH Corporation © 2026
                </span>
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Modals */}
      <UserProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} user={selectedUser} onDM={handleDMFromProfile} />
      <DMModal open={dmOpen} onClose={() => setDmOpen(false)} recipient={selectedUser?.name || 'User'} />
      
      {editPost && (
        <Modal open={!!editPost} onClose={() => {
          setEditPost(null)
          setEditContent('')
          setEditTags([])
        }}>
          <h2>{isEnglish ? 'Edit Post' : '게시물 수정'}</h2>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Write your post..."
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '0.75rem',
              border: '1px solid #E2E8F0',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <div style={{ marginTop: '1rem' }}>
            <input
              type="text"
              value={editTags.join(', ')}
              onChange={(e) => setEditTags(e.target.value.split(',').map(t => t.trim()).filter(t => t))}
              placeholder="Tags (comma separated)"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #E2E8F0',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setEditPost(null)
                setEditContent('')
                setEditTags([])
              }}
              style={{
                padding: '0.5rem 1rem',
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdatePost}
              style={{
                padding: '0.5rem 1rem',
                background: '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              Update
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
