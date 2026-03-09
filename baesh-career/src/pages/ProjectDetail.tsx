import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiGet, apiPut, apiPost, apiDelete } from '../utils/api'
import { useAuth } from '../auth/AuthContext'
import ProjectFormModal from '../forms/ProjectFormModal'
import TeamInviteModal from '../components/TeamInviteModal'
import Modal from '../components/Modal'
import type { Project } from './Projects'

interface TeamMember {
  id: string
  userId: string
  name: string
  role: string
  participationType: 'invited' | 'applied' | 'approved'
  teamRole: 'owner' | 'admin' | 'member' | 'guest'
  projectRoles: string[]
  contributionRatio?: number
}

interface Milestone {
  id: string
  title: string
  description: string
  completed: boolean
  dueDate: string | null
}

interface ActivityLog {
  id: string
  date: string
  todayWork: string
  decisions: string
  issues: string
  links: string[]
  images: string[]
}

interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'doing' | 'done'
  assigneeId?: string
  assigneeName?: string
  dueDate?: string
  priority: 'low' | 'medium' | 'high'
  evidenceLinks: string[]
}

interface ProjectLink {
  id: string
  type: 'github' | 'figma' | 'notion' | 'drive' | 'other'
  url: string
  title: string
  isPinned: boolean
  createdAt: string
}

interface ProjectDetail extends Project {
  teamMembers: TeamMember[]
  milestones: Milestone[]
  activityLogs: ActivityLog[]
  tasks: Task[]
  links: ProjectLink[]
  aiSummary?: string
  contributionAnalysis?: {
    planning: number
    development: number
    design: number
    pm: number
    marketing: number
    other: number
  }
  visibility: 'public' | 'linkShare' | 'teamOnly'
  achievements?: {
    award: boolean
    viewCount?: number
    userCount?: number
    revenue?: number
  }
}

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isEnglish = i18n.language === 'en'
  const { user } = useAuth()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'board' | 'files' | 'ai' | 'settings'>('overview')
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)
  const [readmeContent, setReadmeContent] = useState('')
  const [readmeEditMode, setReadmeEditMode] = useState(false)
  const [addActivityModalOpen, setAddActivityModalOpen] = useState(false)
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false)
  const [addLinkModalOpen, setAddLinkModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingLink, setEditingLink] = useState<ProjectLink | null>(null)

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (projectId) {
      loadProject()
    }
  }, [projectId])

  // Load Font Awesome and Google Fonts
  useEffect(() => {
    const linkFA = document.createElement('link')
    linkFA.rel = 'stylesheet'
    linkFA.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
    document.head.appendChild(linkFA)

    const linkFonts = document.createElement('link')
    linkFonts.rel = 'stylesheet'
    linkFonts.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap'
    document.head.appendChild(linkFonts)

    return () => {
      if (document.head.contains(linkFA)) document.head.removeChild(linkFA)
      if (document.head.contains(linkFonts)) document.head.removeChild(linkFonts)
    }
  }, [])

  const loadProject = async () => {
    try {
      setLoading(true)
      const data = await apiGet<ProjectDetail>(`/projects/${projectId}`)
      const projectData = {
        ...data,
        tasks: data.tasks || [],
        links: data.links || [],
        teamMembers: data.teamMembers || [],
        milestones: data.milestones || [],
        activityLogs: data.activityLogs || [],
        tags: Array.isArray(data.tags) ? data.tags : []
      }
      setProject(projectData)
      // Readme 초기화 (프로젝트 설명을 기본값으로)
      if (!readmeContent) {
        setReadmeContent(`## Objective\n${data.description}\n\n## Key Features\n- Project Management Dashboard\n- AI Resume Analysis\n- Global Networking Feed\n\n## Current Sprint\nFocusing on the frontend implementation of the Project Detail page and integrating the WebSocket notification system.`)
      }
    } catch (error: any) {
      console.error('Failed to load project:', error)
      const errorMessage = error?.message || error?.error || 'Failed to load project'
      alert(errorMessage)
      navigate('/projects')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProject = async (projectData: any) => {
    if (!project) return
    try {
      const updated = await apiPut<ProjectDetail>(`/projects/${project.id}`, projectData)
      setProject(updated)
      setEditModalOpen(false)
    } catch (error) {
      console.error('Failed to update project:', error)
      alert('Failed to update project')
    }
  }

  const handleInviteTeamMembers = async (userIds: string[], message: string, role: string) => {
    if (!project) return
    try {
      await apiPost(`/projects/${project.id}/invite`, {
        userIds,
        message,
        role
      })
      loadProject()
      alert('Invitations sent successfully')
    } catch (error) {
      console.error('Failed to send invitations:', error)
      alert('Failed to send invitations')
    }
  }

  if (loading || !project) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <h3>Loading...</h3>
        </div>
      </div>
    )
  }

  const isOwner = project.userId === user?.id
  const currentMember = project.teamMembers.find(m => m.userId === user?.id)
  const canInvite = isOwner || currentMember?.teamRole === 'admin'

  // 진행률 계산
  const totalTasks = project.tasks.length
  const completedTasks = project.tasks.filter(t => t.status === 'done').length
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // 활동 상태 계산
  const timelineProgress = 80 // 예시 값
  const tasksProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const budgetProgress = 90 // 예시 값

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Inter', sans-serif", color: '#1E293B' }}>
      {/* Sticky Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('/projects') }}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: '#F1F5F9',
                color: '#64748B',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#E2E8F0'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F1F5F9'
              }}
            >
              <i className="fa-solid fa-arrow-left"></i>
            </a>
            <span style={{ color: '#CBD5E1' }}>/</span>
            <span style={{ fontWeight: 700, color: '#475569' }}>Projects</span>
            <span style={{ color: '#CBD5E1' }}>/</span>
            <span style={{ fontWeight: 700, color: '#0F172A' }}>{project.title}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              style={{
                padding: '6px 12px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#475569',
                background: 'white',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F8FAFC'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white'
              }}
            >
              <i className="fa-regular fa-star" style={{ marginRight: '4px' }}></i> Star
            </button>
            {canInvite && (
              <button
                onClick={() => setInviteModalOpen(true)}
                style={{
                  padding: '6px 12px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'white',
                  background: 'linear-gradient(135deg, #2563EB 0%, #9333EA 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                <i className="fa-solid fa-user-plus" style={{ marginRight: '4px' }}></i> Invite
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        {/* Project Header Card */}
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          {/* Gradient Background */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '384px',
            height: '384px',
            background: 'linear-gradient(to bottom left, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
            borderRadius: '50%',
            filter: 'blur(96px)',
            transform: 'translateY(-50%) translateX(33%)',
            pointerEvents: 'none'
          }}></div>

          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: isDesktop ? 'row' : 'column', gap: '24px', alignItems: 'flex-start' }}>
            {/* Project Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #2563EB 0%, #9333EA 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '32px',
              boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)',
              flexShrink: 0
            }}>
              <i className="fa-solid fa-rocket"></i>
            </div>

            {/* Project Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h1 style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: 0
                }}>
                  {project.title}
                </h1>
                {project.status === 'inProgress' && (
                  <span style={{
                    padding: '2px 10px',
                    borderRadius: '9999px',
                    background: '#D1FAE5',
                    color: '#065F46',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: '1px solid #A7F3D0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', animation: 'pulse 2s infinite' }}></span>
                    Active
                  </span>
                )}
              </div>
              <p style={{
                color: '#475569',
                maxWidth: '768px',
                lineHeight: 1.75,
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                {project.description}
              </p>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {project.tags.map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '4px 8px',
                      background: '#F1F5F9',
                      color: '#475569',
                      fontSize: '12px',
                      fontWeight: 500,
                      borderRadius: '4px',
                      border: '1px solid #E2E8F0',
                      fontFamily: "'JetBrains Mono', monospace"
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Progress Ring */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              borderLeft: isDesktop ? '1px solid #F1F5F9' : 'none',
              paddingLeft: isDesktop ? '24px' : 0,
              flexShrink: 0
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: `conic-gradient(#2563EB ${progress}%, #E2E8F0 0)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  width: '48px',
                  height: '48px',
                  background: 'white',
                  borderRadius: '50%'
                }}></div>
                <span style={{
                  position: 'relative',
                  zIndex: 10,
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#2563EB'
                }}>
                  {progress}%
                </span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Progress</span>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ marginTop: '32px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '24px' }}>
            {[
              { key: 'overview', label: 'Overview', icon: null },
              { key: 'tasks', label: 'Tasks', icon: null, badge: project.tasks.length },
              { key: 'board', label: 'Board', icon: null },
              { key: 'files', label: 'Files', icon: null },
              { key: 'ai', label: 'AI Insight', icon: 'fa-solid fa-wand-magic-sparkles', color: '#9333EA' },
              { key: 'settings', label: 'Settings', icon: null }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  position: 'relative',
                  padding: '12px 16px',
                  color: activeTab === tab.key ? '#2563EB' : '#64748B',
                  fontWeight: activeTab === tab.key ? 600 : 500,
                  fontSize: '14px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.color = '#1E293B'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.color = '#64748B'
                  }
                }}
              >
                {tab.icon && <i className={tab.icon} style={{ fontSize: '12px', color: tab.color }}></i>}
                {tab.label}
                {tab.badge !== undefined && (
                  <span style={{
                    marginLeft: '4px',
                    background: '#F1F5F9',
                    color: '#475569',
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    fontSize: '10px',
                    fontWeight: 500
                  }}>
                    {tab.badge}
                  </span>
                )}
                {activeTab === tab.key && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-1px',
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: '#2563EB',
                    borderRadius: '2px 2px 0 0'
                  }}></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(12, 1fr)' : '1fr', gap: '32px' }}>
            {/* Left Column */}
            <div style={{ gridColumn: isDesktop ? 'span 8' : 'span 1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Project Readme */}
              <div style={{
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{
                    fontWeight: 700,
                    color: '#0F172A',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <i className="fa-regular fa-file-lines" style={{ color: '#94A3B8' }}></i> Project Readme
                  </h3>
                  {isOwner && (
                    <button
                      onClick={() => setReadmeEditMode(!readmeEditMode)}
                      style={{
                        fontSize: '12px',
                        color: '#2563EB',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      {readmeEditMode ? 'Save' : 'Edit'}
                    </button>
                  )}
                </div>
                {readmeEditMode ? (
                  <>
                    <textarea
                      value={readmeContent}
                      onChange={(e) => setReadmeContent(e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: '200px',
                        background: '#F8FAFC',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '12px',
                        lineHeight: 1.75,
                        color: '#475569',
                        resize: 'vertical',
                        marginBottom: '12px'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => {
                          setReadmeEditMode(false)
                        }}
                        style={{
                          padding: '6px 12px',
                          background: 'white',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            // Readme를 프로젝트 설명에 저장 (또는 별도 필드로 저장)
                            await apiPut(`/projects/${project.id}`, {
                              description: readmeContent.split('\n')[1] || project.description
                            })
                            setReadmeEditMode(false)
                          } catch (error) {
                            console.error('Failed to save readme:', error)
                            setReadmeEditMode(false)
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          background: '#2563EB',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{
                    background: '#F8FAFC',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '12px',
                    lineHeight: 1.75,
                    color: '#475569',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {readmeContent || `## Objective\n${project.description}\n\n## Key Features\n- Project Management Dashboard\n- AI Resume Analysis\n- Global Networking Feed\n\n## Current Sprint\nFocusing on the frontend implementation of the Project Detail page and integrating the WebSocket notification system.`}
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div style={{
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <h3 style={{ fontWeight: 700, color: '#0F172A', margin: 0 }}>Recent Activity</h3>
                  {isOwner && (
                    <button
                      onClick={() => setAddActivityModalOpen(true)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#2563EB',
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <i className="fa-solid fa-plus" style={{ marginRight: '4px' }}></i> Add Activity
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative', paddingLeft: '16px' }}>
                  <div style={{
                    position: 'absolute',
                    left: '16px',
                    top: '8px',
                    bottom: '8px',
                    width: '2px',
                    background: '#E2E8F0'
                  }}></div>

                  {project.activityLogs.length > 0 ? (
                    project.activityLogs.slice(0, 5).map((log, index) => {
                      const colors = ['#2563EB', '#9333EA', '#94A3B8', '#10B981', '#F59E0B']
                      const color = colors[index % colors.length]
                      const timeAgo = log.date ? (() => {
                        const logDate = new Date(log.date)
                        const now = new Date()
                        const diffMs = now.getTime() - logDate.getTime()
                        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
                        const diffDays = Math.floor(diffHours / 24)
                        if (diffDays > 0) return `${diffDays}d ago`
                        if (diffHours > 0) return `${diffHours}h ago`
                        return 'Just now'
                      })() : '2h ago'
                      return (
                        <div key={log.id} style={{ position: 'relative', paddingLeft: '32px', marginBottom: '24px' }}>
                          <div style={{
                            position: 'absolute',
                            left: '10px',
                            top: '6px',
                            width: '12px',
                            height: '12px',
                            background: color,
                            borderRadius: '50%',
                            border: '2px solid white',
                            boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)',
                            transform: 'translateX(-50%)'
                          }}></div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A', margin: 0 }}>
                                <span style={{ fontWeight: 700 }}>{user?.name || 'You'}</span> {log.todayWork ? 'logged activity' : 'deployed to'} <span style={{
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: '12px',
                                  background: '#F1F5F9',
                                  padding: '2px 4px',
                                  borderRadius: '4px'
                                }}>{log.todayWork ? 'activity' : 'production'}</span>
                              </p>
                              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', margin: 0 }}>
                                {log.todayWork || log.decisions || log.issues || 'Updated project dashboard UI components.'}
                              </p>
                            </div>
                            <span style={{ fontSize: '12px', color: '#94A3B8' }}>{timeAgo}</span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div style={{ paddingLeft: '32px', color: '#94A3B8', fontSize: '14px' }}>
                      No recent activity
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            {isDesktop && (
              <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Squad */}
                <div style={{
                  background: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontWeight: 700, color: '#0F172A', margin: 0 }}>Squad</h3>
                    {canInvite && (
                      <button
                        onClick={() => setInviteModalOpen(true)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: '#F1F5F9',
                          color: '#64748B',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#E2E8F0'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#F1F5F9'
                        }}
                      >
                        <i className="fa-solid fa-plus"></i>
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {project.teamMembers.length > 0 ? (
                      project.teamMembers.slice(0, 3).map((member, index) => {
                        const statusColors = ['#10B981', '#F59E0B', '#94A3B8']
                        const statusColor = statusColors[index % statusColors.length]
                        const profilePhoto = localStorage.getItem(`baesh-profile-photo-${member.userId}`)
                        return (
                          <div
                            key={member.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '8px',
                              borderRadius: '8px',
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
                            <div style={{ position: 'relative' }}>
                              {profilePhoto ? (
                                <img
                                  src={profilePhoto}
                                  alt={member.name}
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: '#F1F5F9',
                                    border: '1px solid #E2E8F0'
                                  }}
                                />
                              ) : (
                                <img
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                                  alt={member.name}
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: '#F1F5F9',
                                    border: '1px solid #E2E8F0'
                                  }}
                                />
                              )}
                              <span style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: '12px',
                                height: '12px',
                                background: statusColor,
                                border: '2px solid white',
                                borderRadius: '50%'
                              }}></span>
                            </div>
                            <div>
                              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                                {member.name}
                              </h4>
                              <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                                {member.teamRole === 'owner' ? 'Project Lead' :
                                 member.role === 'development' ? 'Backend Dev' :
                                 member.role === 'design' ? 'Product Designer' :
                                 member.role || 'Member'}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p style={{ color: '#94A3B8', fontSize: '14px', textAlign: 'center', padding: '16px' }}>
                        No team members yet
                      </p>
                    )}
                  </div>
                </div>

                {/* Project Health */}
                <div style={{
                  background: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}>
                  <h3 style={{ fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>Project Health</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Timeline */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                        <span style={{ color: '#64748B' }}>Timeline</span>
                        <span style={{ color: '#10B981' }}>On Track</span>
                      </div>
                      <div style={{ width: '100%', background: '#F1F5F9', borderRadius: '9999px', height: '8px' }}>
                        <div style={{ width: `${timelineProgress}%`, background: '#10B981', height: '8px', borderRadius: '9999px' }}></div>
                      </div>
                    </div>

                    {/* Tasks Completed */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                        <span style={{ color: '#64748B' }}>Tasks Completed</span>
                        <span style={{ color: '#0F172A' }}>{completedTasks}/{totalTasks}</span>
                      </div>
                      <div style={{ width: '100%', background: '#F1F5F9', borderRadius: '9999px', height: '8px' }}>
                        <div style={{ width: `${tasksProgress}%`, background: '#2563EB', height: '8px', borderRadius: '9999px' }}></div>
                      </div>
                    </div>

                    {/* Budget */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                        <span style={{ color: '#64748B' }}>Budget (Tokens)</span>
                        <span style={{ color: '#F59E0B' }}>Warning</span>
                      </div>
                      <div style={{ width: '100%', background: '#F1F5F9', borderRadius: '9999px', height: '8px' }}>
                        <div style={{ width: `${budgetProgress}%`, background: '#F59E0B', height: '8px', borderRadius: '9999px' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resources */}
                <div style={{
                  background: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontWeight: 700, color: '#0F172A', margin: 0 }}>Resources</h3>
                    {isOwner && (
                      <button
                        onClick={() => {
                          setEditingLink(null)
                          setAddLinkModalOpen(true)
                        }}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: '#F1F5F9',
                          color: '#64748B',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px'
                        }}
                      >
                        <i className="fa-solid fa-plus"></i>
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {project.links.length > 0 ? (
                      project.links.slice(0, 3).map(link => {
                        const linkIcons: Record<string, { icon: string; color: string }> = {
                          github: { icon: 'fa-brands fa-github', color: '#1E293B' },
                          figma: { icon: 'fa-brands fa-figma', color: '#9333EA' },
                          notion: { icon: 'fa-brands fa-notion', color: '#1E293B' },
                          drive: { icon: 'fa-brands fa-google-drive', color: '#2563EB' },
                          other: { icon: 'fa-solid fa-link', color: '#64748B' }
                        }
                        const linkInfo = linkIcons[link.type] || linkIcons.other
                        return (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '8px',
                              fontSize: '14px',
                              color: '#475569',
                              textDecoration: 'none',
                              borderRadius: '8px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#F8FAFC'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent'
                            }}
                          >
                            <i className={linkInfo.icon} style={{ fontSize: '18px', color: linkInfo.color }}></i>
                            {link.title}
                          </a>
                        )
                      })
                    ) : (
                      <p style={{ color: '#94A3B8', fontSize: '14px', textAlign: 'center', padding: '16px' }}>
                        No resources yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <TasksTabSection 
            project={project} 
            setProject={setProject} 
            isOwner={isOwner} 
            onAddTask={(taskId?: string) => {
              if (taskId) {
                const task = project.tasks.find(t => t.id === taskId)
                setEditingTask(task || null)
              } else {
                setEditingTask(null)
              }
              setAddTaskModalOpen(true)
            }} 
          />
        )}

        {/* Board Tab */}
        {activeTab === 'board' && (
          <BoardTabSection 
            project={project} 
            setProject={setProject} 
            isOwner={isOwner} 
            onAddTask={(taskId?: string) => {
              if (taskId) {
                const task = project.tasks.find(t => t.id === taskId)
                setEditingTask(task || null)
              } else {
                setEditingTask(null)
              }
              setAddTaskModalOpen(true)
            }} 
          />
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <FilesTabSection 
            project={project} 
            setProject={setProject} 
            isOwner={isOwner} 
            onAddLink={(linkId?: string) => {
              if (linkId) {
                const link = project.links.find(l => l.id === linkId)
                setEditingLink(link || null)
              } else {
                setEditingLink(null)
              }
              setAddLinkModalOpen(true)
            }}
            onEditLink={(linkId: string) => {
              const link = project.links.find(l => l.id === linkId)
              setEditingLink(link || null)
              setAddLinkModalOpen(true)
            }}
          />
        )}

        {/* AI Insight Tab */}
        {activeTab === 'ai' && (
          <AIInsightTabSection project={project} />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <SettingsTabSection project={project} setProject={setProject} isOwner={isOwner} />
        )}
      </main>

      <ProjectFormModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleUpdateProject}
        initialData={project}
      />

      <TeamInviteModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        projectId={project.id}
        onInvite={handleInviteTeamMembers}
      />

      {/* Add Activity Modal */}
      <AddActivityModal
        open={addActivityModalOpen}
        onClose={() => setAddActivityModalOpen(false)}
        projectId={project.id}
        onAdd={async (activityData) => {
          try {
            // 백엔드 API가 없으면 로컬 상태에 추가
            const newLog: ActivityLog = {
              id: `log-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              todayWork: activityData.todayWork,
              decisions: activityData.decisions,
              issues: activityData.issues,
              links: activityData.links || [],
              images: []
            }
            setProject({
              ...project,
              activityLogs: [newLog, ...project.activityLogs]
            })
            setAddActivityModalOpen(false)
          } catch (error) {
            console.error('Failed to add activity:', error)
          }
        }}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        open={addTaskModalOpen}
        onClose={() => {
          setAddTaskModalOpen(false)
          setEditingTask(null)
        }}
        projectId={project.id}
        task={editingTask}
        teamMembers={project.teamMembers}
        onSave={async (taskData) => {
          try {
            if (editingTask) {
              // 업데이트
              const updated = project.tasks.map(t => 
                t.id === editingTask.id ? { ...t, ...taskData } : t
              )
              setProject({ ...project, tasks: updated })
            } else {
              // 생성
              const newTask: Task = {
                id: `task-${Date.now()}`,
                title: taskData.title,
                description: taskData.description || '',
                status: taskData.status || 'todo',
                assigneeId: taskData.assigneeId,
                assigneeName: taskData.assigneeId ? project.teamMembers.find(m => m.userId === taskData.assigneeId)?.name : undefined,
                dueDate: taskData.dueDate,
                priority: taskData.priority || 'medium',
                evidenceLinks: []
              }
              setProject({ ...project, tasks: [newTask, ...project.tasks] })
            }
            setAddTaskModalOpen(false)
            setEditingTask(null)
          } catch (error) {
            console.error('Failed to save task:', error)
          }
        }}
        onDelete={editingTask ? async () => {
          try {
            setProject({
              ...project,
              tasks: project.tasks.filter(t => t.id !== editingTask.id)
            })
            setAddTaskModalOpen(false)
            setEditingTask(null)
          } catch (error) {
            console.error('Failed to delete task:', error)
          }
        } : undefined}
      />

      {/* Add Link Modal */}
      <AddLinkModal
        open={addLinkModalOpen}
        onClose={() => {
          setAddLinkModalOpen(false)
          setEditingLink(null)
        }}
        projectId={project.id}
        link={editingLink}
        onSave={async (linkData) => {
          try {
            if (editingLink) {
              // 업데이트
              const updated = project.links.map(l =>
                l.id === editingLink.id ? { ...l, ...linkData } : l
              )
              setProject({ ...project, links: updated })
            } else {
              // 생성
              const newLink: ProjectLink = {
                id: `link-${Date.now()}`,
                type: linkData.type,
                url: linkData.url,
                title: linkData.title,
                isPinned: linkData.isPinned || false,
                createdAt: new Date().toISOString()
              }
              setProject({ ...project, links: [newLink, ...project.links] })
            }
            setAddLinkModalOpen(false)
            setEditingLink(null)
          } catch (error) {
            console.error('Failed to save link:', error)
          }
        }}
        onDelete={editingLink ? async () => {
          try {
            setProject({
              ...project,
              links: project.links.filter(l => l.id !== editingLink.id)
            })
            setAddLinkModalOpen(false)
            setEditingLink(null)
          } catch (error) {
            console.error('Failed to delete link:', error)
          }
        } : undefined}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

// Tasks Tab Component
function TasksTabSection({ project, setProject, isOwner, onAddTask }: {
  project: ProjectDetail
  setProject: (p: ProjectDetail) => void
  isOwner: boolean
  onAddTask: (taskId?: string) => void
}) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)

  const handleTaskStatusChange = async (taskId: string, newStatus: 'todo' | 'doing' | 'done') => {
    try {
      const updated = project.tasks.map(t =>
        t.id === taskId ? { ...t, status: newStatus } : t
      )
      setProject({ ...project, tasks: updated })
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E2E8F0',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h3 style={{ fontWeight: 700, color: '#0F172A', margin: 0 }}>Tasks</h3>
        {isOwner && (
          <button
            onClick={onAddTask}
            style={{
              padding: '8px 16px',
              background: '#2563EB',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i> New Task
          </button>
        )}
      </div>
      {project.tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#94A3B8' }}>
          <i className="fa-solid fa-tasks" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}></i>
          <p>No tasks yet. Create your first task to get started!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {project.tasks.map(task => (
            <div
              key={task.id}
              style={{
                padding: '16px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: editingTaskId === task.id ? 'default' : 'pointer'
              }}
              onClick={() => {
                if (isOwner && editingTaskId !== task.id) {
                  setEditingTaskId(task.id)
                }
              }}
            >
              <input
                type="checkbox"
                checked={task.status === 'done'}
                onChange={(e) => {
                  e.stopPropagation()
                  handleTaskStatusChange(task.id, e.target.checked ? 'done' : 'todo')
                }}
                style={{
                  marginTop: '4px',
                  cursor: 'pointer'
                }}
              />
              <div style={{ flex: 1 }}>
                {editingTaskId === task.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      defaultValue={task.title}
                      onBlur={(e) => {
                        const updated = project.tasks.map(t =>
                          t.id === task.id ? { ...t, title: e.target.value } : t
                        )
                        setProject({ ...project, tasks: updated })
                        setEditingTaskId(null)
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur()
                        }
                      }}
                      style={{
                        padding: '8px',
                        border: '1px solid #2563EB',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: 600
                      }}
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <h4 style={{ fontWeight: 600, color: '#0F172A', margin: 0, marginBottom: '4px' }}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p style={{ fontSize: '14px', color: '#64748B', margin: 0, marginBottom: '8px' }}>
                        {task.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{
                        padding: '4px 8px',
                        background: task.status === 'done' ? '#D1FAE5' :
                                    task.status === 'doing' ? '#DBEAFE' : '#F1F5F9',
                        color: task.status === 'done' ? '#065F46' :
                               task.status === 'doing' ? '#1E40AF' : '#475569',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '4px'
                      }}>
                        {task.status === 'done' ? 'Done' : task.status === 'doing' ? 'Doing' : 'To Do'}
                      </span>
                      {task.priority && (
                        <span style={{
                          padding: '4px 8px',
                          background: task.priority === 'high' ? '#FEE2E2' :
                                      task.priority === 'medium' ? '#FEF3C7' : '#F1F5F9',
                          color: task.priority === 'high' ? '#991B1B' :
                                 task.priority === 'medium' ? '#92400E' : '#475569',
                          fontSize: '12px',
                          fontWeight: 600,
                          borderRadius: '4px'
                        }}>
                          {task.priority}
                        </span>
                      )}
                      {task.assigneeName && (
                        <span style={{ fontSize: '12px', color: '#64748B' }}>
                          👤 {task.assigneeName}
                        </span>
                      )}
                      {task.dueDate && (
                        <span style={{ fontSize: '12px', color: '#64748B' }}>
                          📅 {task.dueDate}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
              {isOwner && editingTaskId !== task.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddTask(task.id)
                  }}
                  style={{
                    padding: '4px 8px',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  <i className="fa-solid fa-edit"></i>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Board Tab Component (Kanban)
function BoardTabSection({ project, setProject, isOwner, onAddTask }: {
  project: ProjectDetail
  setProject: (p: ProjectDetail) => void
  isOwner: boolean
  onAddTask: (taskId?: string) => void
}) {
  const tasksByStatus = {
    todo: project.tasks.filter(t => t.status === 'todo'),
    doing: project.tasks.filter(t => t.status === 'doing'),
    done: project.tasks.filter(t => t.status === 'done')
  }

  const handleTaskStatusChange = async (taskId: string, newStatus: 'todo' | 'doing' | 'done') => {
    try {
      const updated = project.tasks.map(t =>
        t.id === taskId ? { ...t, status: newStatus } : t
      )
      setProject({ ...project, tasks: updated })
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h3 style={{ fontWeight: 700, color: '#0F172A', margin: 0 }}>Task Board</h3>
        {isOwner && (
          <button
            onClick={onAddTask}
            style={{
              padding: '8px 16px',
              background: '#2563EB',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i> New Task
          </button>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {(['todo', 'doing', 'done'] as const).map(status => (
          <div
            key={status}
            style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '16px',
              minHeight: '400px'
            }}
          >
            <h4 style={{
              fontWeight: 700,
              color: '#0F172A',
              marginBottom: '16px',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {status === 'todo' ? 'To Do' : status === 'doing' ? 'Doing' : 'Done'} ({tasksByStatus[status].length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tasksByStatus[status].map(task => (
                <div
                  key={task.id}
                  draggable={isOwner}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('taskId', task.id)
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    const taskId = e.dataTransfer.getData('taskId')
                    handleTaskStatusChange(taskId, status)
                  }}
                  onClick={() => {
                    if (isOwner) {
                      onAddTask(task.id)
                    }
                  }}
                  style={{
                    padding: '12px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    cursor: isOwner ? 'pointer' : 'default',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (isOwner) {
                      e.currentTarget.style.background = '#F1F5F9'
                      e.currentTarget.style.borderColor = '#CBD5E1'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isOwner) {
                      e.currentTarget.style.background = '#F8FAFC'
                      e.currentTarget.style.borderColor = '#E2E8F0'
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <h5 style={{ fontWeight: 600, color: '#0F172A', margin: 0, marginBottom: '4px' }}>
                        {task.title}
                      </h5>
                      {task.description && (
                        <p style={{ fontSize: '12px', color: '#64748B', margin: 0, marginBottom: '8px' }}>
                          {task.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {task.priority && (
                          <span style={{
                            padding: '2px 6px',
                            background: task.priority === 'high' ? '#FEE2E2' :
                                        task.priority === 'medium' ? '#FEF3C7' : '#F1F5F9',
                            color: task.priority === 'high' ? '#991B1B' :
                                   task.priority === 'medium' ? '#92400E' : '#475569',
                            fontSize: '10px',
                            borderRadius: '4px',
                            fontWeight: 600
                          }}>
                            {task.priority}
                          </span>
                        )}
                        {task.assigneeName && (
                          <span style={{ fontSize: '10px', color: '#64748B' }}>
                            👤 {task.assigneeName}
                          </span>
                        )}
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onAddTask(task.id)
                        }}
                        style={{
                          padding: '4px',
                          background: 'transparent',
                          border: 'none',
                          color: '#64748B',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        <i className="fa-solid fa-edit"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {tasksByStatus[status].length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: '#94A3B8', fontSize: '14px' }}>
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Files Tab Component
function FilesTabSection({ project, setProject, isOwner, onAddLink, onEditLink }: {
  project: ProjectDetail
  setProject: (p: ProjectDetail) => void
  isOwner: boolean
  onAddLink: (linkId?: string) => void
  onEditLink: (linkId: string) => void
}) {
  const linkIcons: Record<string, { icon: string; color: string }> = {
    github: { icon: 'fa-brands fa-github', color: '#1E293B' },
    figma: { icon: 'fa-brands fa-figma', color: '#9333EA' },
    notion: { icon: 'fa-brands fa-notion', color: '#1E293B' },
    drive: { icon: 'fa-brands fa-google-drive', color: '#2563EB' },
    other: { icon: 'fa-solid fa-link', color: '#64748B' }
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E2E8F0',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h3 style={{ fontWeight: 700, color: '#0F172A', margin: 0 }}>Files & Links</h3>
        {isOwner && (
          <button
            onClick={onAddLink}
            style={{
              padding: '8px 16px',
              background: '#2563EB',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i> Add Link
          </button>
        )}
      </div>
      {project.links.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#94A3B8' }}>
          <i className="fa-solid fa-link" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}></i>
          <p>No links yet. Add resources to help your team collaborate!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {project.links.map(link => {
            const linkInfo = linkIcons[link.type] || linkIcons.other
            return (
                  <div
                    key={link.id}
                    style={{
                      padding: '16px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F1F5F9'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#F8FAFC'
                    }}
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        textDecoration: 'none',
                        color: '#0F172A',
                        flex: 1
                      }}
                    >
                      <i className={linkInfo.icon} style={{ fontSize: '24px', color: linkInfo.color }}></i>
                      <div>
                        <h4 style={{ fontWeight: 600, margin: 0, marginBottom: '4px' }}>{link.title}</h4>
                        <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>{link.url}</p>
                      </div>
                    </a>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {link.isPinned && (
                        <span style={{ color: '#F59E0B', fontSize: '14px' }}>📌</span>
                      )}
                      {isOwner && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditLink(link.id)
                          }}
                          style={{
                            padding: '4px 8px',
                            background: 'transparent',
                            border: 'none',
                            color: '#64748B',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          <i className="fa-solid fa-edit"></i>
                        </button>
                      )}
                    </div>
                  </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// AI Insight Tab Component
function AIInsightTabSection({ project }: { project: ProjectDetail }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #E2E8F0',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    }}>
      <h3 style={{ fontWeight: 700, color: '#0F172A', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <i className="fa-solid fa-wand-magic-sparkles" style={{ color: '#9333EA' }}></i> AI Insight
      </h3>
      {project.aiSummary ? (
        <div style={{
          background: 'linear-gradient(135deg, #0F172A, #1E293B)',
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <p style={{ lineHeight: 1.8, margin: 0 }}>{project.aiSummary}</p>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px', color: '#94A3B8' }}>
          <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}></i>
          <p>AI analysis will be generated as the project progresses.</p>
        </div>
      )}
      {project.contributionAnalysis && (
        <div>
          <h4 style={{ fontWeight: 600, color: '#0F172A', marginBottom: '16px' }}>Contribution Analysis</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(project.contributionAnalysis)
              .filter(([_, value]) => value > 0)
              .map(([role, percentage]) => (
                <div key={role}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>{role}</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{percentage}%</span>
                  </div>
                  <div style={{ width: '100%', background: '#F1F5F9', borderRadius: '9999px', height: '8px' }}>
                    <div style={{
                      width: `${percentage}%`,
                      background: '#2563EB',
                      height: '8px',
                      borderRadius: '9999px'
                    }}></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Settings Tab Component
function SettingsTabSection({ project, setProject, isOwner }: {
  project: ProjectDetail
  setProject: (p: ProjectDetail) => void
  isOwner: boolean
}) {
  const handleVisibilityChange = async (visibility: 'public' | 'linkShare' | 'teamOnly') => {
    try {
      const updated = await apiPut<ProjectDetail>(`/projects/${project.id}`, { visibility })
      setProject({ ...project, visibility: updated.visibility })
    } catch (error) {
      console.error('Failed to update visibility:', error)
    }
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E2E8F0',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    }}>
      <h3 style={{ fontWeight: 700, color: '#0F172A', marginBottom: '24px' }}>Project Settings</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h4 style={{ fontWeight: 600, color: '#0F172A', marginBottom: '12px' }}>Visibility</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(['public', 'linkShare', 'teamOnly'] as const).map(visibility => (
              <label
                key={visibility}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  background: project.visibility === visibility ? '#EFF6FF' : '#F8FAFC',
                  border: `1px solid ${project.visibility === visibility ? '#BFDBFE' : '#E2E8F0'}`,
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={visibility}
                  checked={project.visibility === visibility}
                  onChange={() => handleVisibilityChange(visibility)}
                  disabled={!isOwner}
                />
                <div>
                  <div style={{ fontWeight: 600, color: '#0F172A' }}>
                    {visibility === 'public' ? 'Public' :
                     visibility === 'linkShare' ? 'Link Share' : 'Team Only'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    {visibility === 'public' ? 'Anyone can view this project' :
                     visibility === 'linkShare' ? 'Only people with the link can view' :
                     'Only team members can view'}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Add Activity Modal Component
function AddActivityModal({ open, onClose, projectId, onAdd }: {
  open: boolean
  onClose: () => void
  projectId: string
  onAdd: (data: { todayWork: string; decisions: string; issues: string; links: string[] }) => void
}) {
  const [todayWork, setTodayWork] = useState('')
  const [decisions, setDecisions] = useState('')
  const [issues, setIssues] = useState('')
  const [links, setLinks] = useState('')

  const handleSubmit = () => {
    if (!todayWork.trim()) {
      alert('Please enter what you worked on today')
      return
    }
    onAdd({
      todayWork,
      decisions,
      issues,
      links: links.split(',').map(l => l.trim()).filter(l => l)
    })
    setTodayWork('')
    setDecisions('')
    setIssues('')
    setLinks('')
  }

  if (!open) return null

  return (
    <Modal open={open} onClose={onClose}>
      <h2 style={{ marginBottom: '16px' }}>Add Activity</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>What did you work on today? *</label>
          <textarea
            value={todayWork}
            onChange={(e) => setTodayWork(e.target.value)}
            placeholder="Describe what you accomplished..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Decisions Made</label>
          <textarea
            value={decisions}
            onChange={(e) => setDecisions(e.target.value)}
            placeholder="Any important decisions?"
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '12px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Issues / Blockers</label>
          <textarea
            value={issues}
            onChange={(e) => setIssues(e.target.value)}
            placeholder="Any blockers or issues?"
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '12px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Links (comma separated)</label>
          <input
            type="text"
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            placeholder="https://example.com, https://github.com/..."
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: '8px 16px',
              background: '#2563EB',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Add Activity
          </button>
        </div>
      </div>
    </Modal>
  )
}

// Add Task Modal Component
function AddTaskModal({ open, onClose, projectId, task, teamMembers, onSave, onDelete }: {
  open: boolean
  onClose: () => void
  projectId: string
  task: Task | null
  teamMembers: TeamMember[]
  onSave: (data: Partial<Task>) => void
  onDelete?: () => void
}) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [status, setStatus] = useState<'todo' | 'doing' | 'done'>(task?.status || 'todo')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task?.priority || 'medium')
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId || '')
  const [dueDate, setDueDate] = useState(task?.dueDate || '')
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setStatus(task.status)
      setPriority(task.priority)
      setAssigneeId(task.assigneeId || '')
      setDueDate(task.dueDate || '')
    } else {
      setTitle('')
      setDescription('')
      setStatus('todo')
      setPriority('medium')
      setAssigneeId('')
      setDueDate('')
    }
  }, [task, open])

  useEffect(() => {
    if (open) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      setIsAnimating(false)
    }
  }, [open])

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('Please enter a task title')
      return
    }
    onSave({ title, description, status, priority, assigneeId, dueDate })
  }

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  if (!open) return null

  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'doing', label: 'In Progress' },
    { value: 'done', label: 'Done' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low ☕' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High 🔥' }
  ]

  const statusLabel = statusOptions.find(o => o.value === status)?.label || 'To Do'
  const priorityLabel = priorityOptions.find(o => o.value === priority)?.label || 'Medium'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          transition: 'opacity 0.3s',
          opacity: isAnimating ? 1 : 0
        }}
      />

      {/* Modal Panel */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '672px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          transform: isAnimating ? 'scale(1)' : 'scale(0.95)',
          opacity: isAnimating ? 1 : 0,
          transition: 'all 0.3s',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Top Bar */}
        <div style={{
          height: '6px',
          width: '100%',
          background: 'linear-gradient(to right, #3B82F6, #9333EA, #EC4899)'
        }} />

        {/* Header */}
        <div style={{
          padding: '32px 32px 16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <h3 style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '24px',
              fontWeight: 800,
              color: '#0F172A',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fa-solid fa-layer-group" style={{ color: '#3B82F6' }}></i>
              {task ? 'Edit Task' : 'New Task'}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#64748B',
              margin: '4px 0 0 0'
            }}>
              Define a new mission for your squad.
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.2s',
              fontSize: '20px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F1F5F9'
              e.currentTarget.style.color = '#475569'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#94A3B8'
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '0 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Title Input */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              style={{
                width: '100%',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '20px',
                fontWeight: 700,
                fontFamily: "'Manrope', sans-serif",
                color: '#1E293B',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.borderColor = '#3B82F6'
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = '#F8FAFC'
                e.currentTarget.style.borderColor = '#E2E8F0'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Grid: Assignee, Due Date, Priority, Status */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px'
          }}>
            {/* Assignee */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '6px',
                marginLeft: '4px'
              }}>
                Assignee
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '12px 40px 12px 40px',
                    fontSize: '14px',
                    color: '#1E293B',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.borderColor = '#3B82F6'
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = '#F8FAFC'
                    e.currentTarget.style.borderColor = '#E2E8F0'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <option value="">Select member...</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.userId}>{member.name}</option>
                  ))}
                  <option value="">Unassigned</option>
                </select>
                <i className="fa-regular fa-user" style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94A3B8',
                  pointerEvents: 'none'
                }}></i>
                <i className="fa-solid fa-chevron-down" style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748B',
                  fontSize: '12px',
                  pointerEvents: 'none'
                }}></i>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '6px',
                marginLeft: '4px'
              }}>
                Due Date
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '12px 40px 12px 40px',
                    fontSize: '14px',
                    color: '#475569',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.borderColor = '#3B82F6'
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = '#F8FAFC'
                    e.currentTarget.style.borderColor = '#E2E8F0'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                <i className="fa-regular fa-calendar" style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94A3B8',
                  pointerEvents: 'none'
                }}></i>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '6px',
                marginLeft: '4px'
              }}>
                Priority
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  style={{
                    width: '100%',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '12px 40px 12px 40px',
                    fontSize: '14px',
                    color: '#1E293B',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.borderColor = '#3B82F6'
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = '#F8FAFC'
                    e.currentTarget.style.borderColor = '#E2E8F0'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {priorityOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <i className="fa-solid fa-flag" style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#F59E0B',
                  pointerEvents: 'none'
                }}></i>
                <i className="fa-solid fa-chevron-down" style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748B',
                  fontSize: '12px',
                  pointerEvents: 'none'
                }}></i>
              </div>
            </div>

            {/* Status */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '6px',
                marginLeft: '4px'
              }}>
                Status
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'todo' | 'doing' | 'done')}
                  style={{
                    width: '100%',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '12px 40px 12px 40px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#1E293B',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.borderColor = '#3B82F6'
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = '#F8FAFC'
                    e.currentTarget.style.borderColor = '#E2E8F0'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <i className="fa-regular fa-circle" style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94A3B8',
                  pointerEvents: 'none'
                }}></i>
                <i className="fa-solid fa-chevron-down" style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748B',
                  fontSize: '12px',
                  pointerEvents: 'none'
                }}></i>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 700,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '6px',
              marginLeft: '4px'
            }}>
              Description
            </label>
            <div style={{ position: 'relative' }}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details, context, or subtasks..."
                rows={4}
                style={{
                  width: '100%',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '12px 40px 12px 12px',
                  fontSize: '14px',
                  color: '#1E293B',
                  outline: 'none',
                  resize: 'none',
                  transition: 'all 0.2s',
                  fontFamily: "'Inter', sans-serif"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = 'white'
                  e.currentTarget.style.borderColor = '#3B82F6'
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = '#F8FAFC'
                  e.currentTarget.style.borderColor = '#E2E8F0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                display: 'flex',
                gap: '8px',
                color: '#94A3B8',
                fontSize: '14px'
              }}>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#3B82F6'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                >
                  <i className="fa-solid fa-paperclip"></i>
                </button>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#3B82F6'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                >
                  <i className="fa-regular fa-image"></i>
                </button>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#3B82F6'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                >
                  <i className="fa-solid fa-list-ul"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: '#F8FAFC',
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #F1F5F9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="createAnother"
              style={{
                borderRadius: '4px',
                border: '1px solid #D1D5DB',
                accentColor: '#3B82F6'
              }}
            />
            <label
              htmlFor="createAnother"
              style={{
                fontSize: '14px',
                color: '#64748B',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              Create another
            </label>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {task && onDelete && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this task?')) {
                    onDelete()
                  }
                }}
                style={{
                  padding: '10px 20px',
                  background: '#FEE2E2',
                  color: '#991B1B',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FECACA'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FEE2E2'
                }}
              >
                Delete
              </button>
            )}
            <button
              onClick={handleClose}
              style={{
                padding: '10px 20px',
                background: 'white',
                color: '#475569',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F1F5F9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(to right, #2563EB, #9333EA)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <i className="fa-solid fa-plus"></i>
              {task ? 'Update' : 'Create'} Task
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add Link Modal Component
function AddLinkModal({ open, onClose, projectId, link, onSave, onDelete }: {
  open: boolean
  onClose: () => void
  projectId: string
  link: ProjectLink | null
  onSave: (data: Partial<ProjectLink>) => void
  onDelete?: () => void
}) {
  const [type, setType] = useState<'github' | 'figma' | 'notion' | 'drive' | 'other'>(link?.type || 'other')
  const [title, setTitle] = useState(link?.title || '')
  const [url, setUrl] = useState(link?.url || '')
  const [isPinned, setIsPinned] = useState(link?.isPinned || false)

  useEffect(() => {
    if (link) {
      setType(link.type)
      setTitle(link.title)
      setUrl(link.url)
      setIsPinned(link.isPinned)
    } else {
      setType('other')
      setTitle('')
      setUrl('')
      setIsPinned(false)
    }
  }, [link, open])

  const handleSubmit = () => {
    if (!title.trim() || !url.trim()) {
      alert('Please enter both title and URL')
      return
    }
    onSave({ type, title, url, isPinned })
  }

  if (!open) return null

  return (
    <Modal open={open} onClose={onClose}>
      <h2 style={{ marginBottom: '16px' }}>{link ? 'Edit Link' : 'Add Link'}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            <option value="github">GitHub</option>
            <option value="figma">Figma</option>
            <option value="notion">Notion</option>
            <option value="drive">Google Drive</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Link title"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>URL *</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
            />
            <span>Pin to top</span>
          </label>
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          {link && onDelete && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this link?')) {
                  onDelete()
                }
              }}
              style={{
                padding: '8px 16px',
                background: '#FEE2E2',
                color: '#991B1B',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: '8px 16px',
              background: '#2563EB',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            {link ? 'Update' : 'Add'} Link
          </button>
        </div>
      </div>
    </Modal>
  )
}
