import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiGet, apiPost, apiDelete } from '../utils/api'
import { useAuth } from '../auth/AuthContext'
import ProjectFormModal from '../forms/ProjectFormModal'

export interface Project {
  id: string
  title: string
  description: string
  type: string
  startDate: string
  endDate: string | null
  isOngoing: boolean
  tags: string[]
  status: 'idea' | 'inProgress' | 'completed' | 'paused' | 'recruiting'
  createdAt: string
  updatedAt: string
  userId: string
  progress?: number
  teamMembers?: Array<{ id: string; name: string; avatar?: string }>
}

export default function Projects() {
  const { t, i18n } = useTranslation()
  const isEnglish = i18n.language === 'en'
  const navigate = useNavigate()
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)

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
      if (document.head.contains(linkFA)) document.head.removeChild(linkFA)
      if (document.head.contains(linkFonts)) document.head.removeChild(linkFonts)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await apiGet<{ projects: Project[] }>('/projects')
      // Add progress and team member info (use defaults if no actual data)
      const projectsWithDefaults = (data.projects || []).map(project => ({
        ...project,
        progress: project.progress || (project.status === 'inProgress' ? 75 : project.status === 'completed' ? 100 : 0),
        teamMembers: project.teamMembers || []
      }))
      setProjects(projectsWithDefaults)
    } catch (error) {
      console.error('Failed to load projects:', error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (projectData: any) => {
    try {
      const newProject = await apiPost<Project>('/projects', projectData)
      setProjects([newProject, ...projects])
      navigate(`/projects/${newProject.id}`)
    } catch (error: any) {
      console.error('Failed to create project:', error)
      const errorMessage = error?.message || error?.error || 'Failed to create project'
      alert(`Error: ${errorMessage}`)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return
    }
    try {
      await apiDelete(`/projects/${projectId}`)
      setProjects(projects.filter(p => p.id !== projectId))
    } catch (error) {
      console.error('Failed to delete project:', error)
      alert('Failed to delete project')
    }
  }

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: string }> = {
      idea: { label: 'Idea', color: '#64748B', icon: 'fa-lightbulb' },
      inProgress: { label: 'In Progress', color: '#2563EB', icon: 'fa-spinner' },
      completed: { label: 'Completed', color: '#059669', icon: 'fa-check-circle' },
      paused: { label: 'Paused', color: '#F59E0B', icon: 'fa-pause' },
      recruiting: { label: 'Recruiting', color: '#9333EA', icon: 'fa-user-plus' }
    }
    const info = statusMap[status] || statusMap.idea
    return {
      label: info.label,
      color: info.color,
      icon: info.icon
    }
  }

  // Calculate statistics
  const activeProjects = projects.filter(p => p.status === 'inProgress').length
  const pendingInvites = 2 // 실제 데이터가 없으면 기본값
  const shippedProjects = projects.filter(p => p.status === 'completed').length

  // 진행률 바 애니메이션
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        document.querySelectorAll('.progress-bar-fill').forEach((bar) => {
          const element = bar as HTMLElement
          const width = element.style.width
          element.style.width = '0%'
          setTimeout(() => {
            element.style.width = width
          }, 100)
        })
      }, 100)
    }
  }, [loading, projects])

  if (loading) {
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
          <h3 style={{ margin: 0, marginBottom: 8, color: '#1E293B' }}>Loading projects...</h3>
          <p style={{ color: '#64748B', margin: 0 }}>Please wait a moment.</p>
        </div>
      </div>
    )
  }

  const userProfilePhoto = user?.id 
    ? localStorage.getItem(`baesh-profile-photo-${user.id}`)
    : null

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      fontFamily: "'Inter', sans-serif",
      color: '#1E293B'
    }}>
      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '2.5rem 1rem',
        width: '100%'
      }}>
        {/* Header Section */}
        <div style={{
          display: 'flex',
          flexDirection: isDesktop ? 'row' : 'column',
          alignItems: isDesktop ? 'center' : 'flex-start',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          <div>
            <h1 style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '1.875rem',
              fontWeight: 700,
              color: '#0F172A',
              margin: 0,
              marginBottom: '0.25rem'
            }}>
              My Projects
            </h1>
            <p style={{
              color: '#64748B',
              margin: 0,
              fontSize: '0.875rem'
            }}>
              Manage your missions and collaborate with global peers.
            </p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #9333EA 100%)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              fontWeight: 700,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
              fontSize: '0.875rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(37, 99, 235, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <i className="fa-solid fa-plus" style={{ transition: 'transform 0.3s' }}></i>
            Create New Project
          </button>
        </div>

        {/* Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          <div style={{
            background: 'white',
            padding: '1.25rem',
            borderRadius: '0.75rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.5rem',
              background: '#DBEAFE',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem'
            }}>
              <i className="fa-solid fa-rocket"></i>
            </div>
            <div>
              <span style={{
                display: 'block',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#0F172A'
              }}>
                {activeProjects}
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: '#64748B',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.05em'
              }}>
                Active Projects
              </span>
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '1.25rem',
            borderRadius: '0.75rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.5rem',
              background: '#FED7AA',
              color: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem'
            }}>
              <i className="fa-regular fa-clock"></i>
            </div>
            <div>
              <span style={{
                display: 'block',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#0F172A'
              }}>
                {pendingInvites}
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: '#64748B',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.05em'
              }}>
                Pending Invites
              </span>
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '1.25rem',
            borderRadius: '0.75rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.5rem',
              background: '#D1FAE5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem'
            }}>
              <i className="fa-solid fa-trophy"></i>
            </div>
            <div>
              <span style={{
                display: 'block',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#0F172A'
              }}>
                {shippedProjects}
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: '#64748B',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.05em'
              }}>
                {isEnglish ? 'Shipped' : '완료'}
              </span>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr',
          gap: '2rem'
        }}>
          {projects.map(project => {
            const statusInfo = getStatusInfo(project.status)
            const progress = project.progress || 0
            const teamMembers = project.teamMembers || []
            
            return (
              <div
                key={project.id}
                style={{
                  background: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)'
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.01)'
                  e.currentTarget.style.borderColor = '#CBD5E1'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = '#E2E8F0'
                }}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                {/* Project Image */}
                <div style={{
                  height: '160px',
                  background: '#E2E8F0',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <img
                    src={`https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000&auto=format&fit=crop&seed=${project.id}`}
                    alt={project.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  />
                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem'
                  }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: statusInfo.color,
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem'
                    }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: statusInfo.color,
                        display: 'inline-block',
                        animation: project.status === 'inProgress' || project.status === 'recruiting' ? 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' : 'none'
                      }}></span>
                      {statusInfo.label}
                    </span>
                  </div>
                  {/* Options Button */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem'
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Handle options menu
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(8px)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      <i className="fa-solid fa-ellipsis"></i>
                    </button>
                  </div>
                </div>

                {/* Project Content */}
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: '#0F172A',
                    margin: 0,
                    marginBottom: '0.5rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = statusInfo.color
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#0F172A'
                  }}
                  >
                    {project.title}
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#64748B',
                    margin: 0,
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {project.description}
                  </p>

                  {/* Progress Bar */}
                  {project.status === 'inProgress' && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#475569',
                        marginBottom: '0.25rem'
                      }}>
                        <span>Development Phase</span>
                        <span>{progress}%</span>
                      </div>
                      <div style={{
                        width: '100%',
                        background: '#F1F5F9',
                        borderRadius: '9999px',
                        height: '6px',
                        overflow: 'hidden'
                      }}>
                        <div
                          className="progress-bar-fill"
                          style={{
                            background: 'linear-gradient(90deg, #60A5FA, #A855F7)',
                            height: '100%',
                            borderRadius: '9999px',
                            width: `${progress}%`,
                            transition: 'width 1s ease-out'
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {project.status === 'recruiting' && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#475569',
                        marginBottom: '0.25rem'
                      }}>
                        <span>Team Building</span>
                        <span>{teamMembers.length}/4 Members</span>
                      </div>
                      <div style={{
                        width: '100%',
                        background: '#F1F5F9',
                        borderRadius: '9999px',
                        height: '6px',
                        overflow: 'hidden'
                      }}>
                        <div
                          className="progress-bar-fill"
                          style={{
                            background: '#A855F7',
                            height: '100%',
                            borderRadius: '9999px',
                            width: `${(teamMembers.length / 4) * 100}%`,
                            transition: 'width 1s ease-out'
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '1rem',
                    borderTop: '1px solid #F1F5F9'
                  }}>
                    {/* Team Members */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '-0.5rem' }}>
                      {teamMembers.slice(0, 2).map((member, i) => (
                        <div
                          key={member.id}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: '2px solid white',
                            marginLeft: i > 0 ? '-8px' : 0,
                            overflow: 'hidden',
                            background: '#F1F5F9'
                          }}
                        >
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                              alt={member.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )}
                        </div>
                      ))}
                      {teamMembers.length > 2 && (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          border: '2px solid white',
                          marginLeft: '-8px',
                          background: '#F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          color: '#64748B',
                          fontWeight: 700
                        }}>
                          +{teamMembers.length - 2}
                        </div>
                      )}
                      {teamMembers.length === 0 && userProfilePhoto && (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          border: '2px solid white',
                          overflow: 'hidden',
                          background: '#F1F5F9'
                        }}>
                          <img src={userProfilePhoto} alt={user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {project.tags.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          style={{
                            padding: '0.125rem 0.5rem',
                            background: project.status === 'recruiting' ? '#F3E8FF' : '#F1F5F9',
                            color: project.status === 'recruiting' ? '#9333EA' : '#475569',
                            fontSize: '10px',
                            fontWeight: 700,
                            borderRadius: '0.25rem',
                            border: project.status === 'recruiting' ? '1px solid #E9D5FF' : 'none'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Create New Project Card */}
          <div
            style={{
              border: '2px dashed #CBD5E1',
              borderRadius: '1rem',
              background: '#F8FAFC',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '2rem',
              minHeight: '350px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#60A5FA'
              e.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#CBD5E1'
              e.currentTarget.style.background = '#F8FAFC'
            }}
            onClick={() => setCreateModalOpen(true)}
          >
            <div style={{
              width: '64px',
              height: '64px',
              background: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              marginBottom: '1rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)'
              e.currentTarget.style.color = '#2563EB'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.color = '#94A3B8'
            }}
            >
              <i className="fa-solid fa-lightbulb" style={{ fontSize: '1.5rem' }}></i>
            </div>
            <h3 style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '1.125rem',
              fontWeight: 700,
              color: '#475569',
              margin: 0,
              marginBottom: '0.5rem'
            }}>
              Have a new idea?
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: '#64748B',
              margin: 0,
              marginBottom: '1.5rem',
              maxWidth: '200px'
            }}>
              Turn your idea into a project. Find team members and start building.
            </p>
            <button style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#2563EB',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1D4ED8'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#2563EB'
            }}
            >
              Start Drafting <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </main>

      {/* Add CSS for ping animation */}
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>

      <ProjectFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateProject}
      />
    </div>
  )
}
