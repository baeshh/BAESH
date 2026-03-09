import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';

type TabType = 'Jobs' | 'Contests' | 'Education' | 'Hackathons' | 'Activities';
type SortType = 'By Deadline' | 'By Match Score' | 'Latest' | 'Popular';

// Company logo URL mapping
const companyLogos: Record<string, string> = {
  '네이버': 'https://www.navercorp.com/img/navercorp_og_img.png',
  '카카오': 'https://www.kakaocorp.com/page/favicon.ico',
  '토스': 'https://toss.im/favicon.ico',
  '당근마켓': 'https://www.daangn.com/favicon.ico',
  '라인': 'https://line.me/favicon.ico',
  '쿠팡': 'https://www.coupang.com/favicon.ico',
  'Meta': 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta-Logo.png',
  'Microsoft': 'https://www.microsoft.com/favicon.ico',
  'Google': 'https://www.google.com/favicon.ico',
  'Amazon': 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
  'Apple': 'https://www.apple.com/favicon.ico',
  'Naver': 'https://www.navercorp.com/img/navercorp_og_img.png',
};

// Job dummy data
const recommendedJobs = [
  {
    id: 'job-global-1',
    title: 'AI Research Scientist',
    company: 'Meta',
    position: 'Senior',
    matchRate: 95,
    skills: ['LLM', 'PyTorch'],
    summary: 'Lead research on large language models and develop next-generation AI systems.',
    deadline: '2d ago',
    location: 'London (Hybrid)',
    logo: companyLogos['Meta'],
  },
  {
    id: 'job-global-2',
    title: 'AI Hackathon 2026',
    company: 'Naver Cloud',
    position: 'Hackathon',
    matchRate: 88,
    skills: ['Prize $10k'],
    summary: 'Online hackathon for AI innovation',
    deadline: 'D-3',
    location: 'Online',
    logo: companyLogos['Naver'],
    isHackathon: true
  },
  {
    id: 'job-global-3',
    title: 'Founding Engineer',
    company: 'Stealth Startup',
    position: 'Senior',
    matchRate: 82,
    skills: ['Equity 2.0%', 'Fullstack'],
    summary: 'Early stage startup looking for founding engineer',
    deadline: 'Early Stage',
    location: 'Remote',
    logo: null,
    isStartup: true
  },
];

const allJobs = [
  {
    id: 'job-1',
    title: 'Backend Engineer (AWS)',
    company: 'Amazon',
    position: 'Senior',
    skills: ['Java', 'Distributed'],
    experience: 'Experienced' as const,
    type: 'Full-time' as const,
    location: 'Seattle (On-site)',
    deadline: 'Apply by Jan 30',
    aiMatch: 89,
    logo: companyLogos['Amazon'],
  },
  {
    id: 'job-2',
    title: 'iOS Developer (Swift)',
    company: 'Apple',
    position: 'Mid',
    skills: ['SwiftUI', 'UIKit'],
    experience: 'Experienced' as const,
    type: 'Full-time' as const,
    location: 'Cupertino',
    deadline: '2 weeks left',
    aiMatch: 87,
    logo: companyLogos['Apple'],
  },
  {
    id: 'job-3',
    title: 'Software Engineer (Azure AI)',
    company: 'Microsoft',
    position: 'Senior',
    skills: ['C#', 'Azure'],
    experience: 'Experienced' as const,
    type: 'Full-time' as const,
    location: 'Redmond',
    deadline: 'Posted today',
    aiMatch: 85,
    logo: companyLogos['Microsoft'],
  },
];

export default function Lounge() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('Jobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Jobs & Internships');
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set(['Python']));
  const [sortType, setSortType] = useState<SortType>('By Match Score');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

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

  const handleApply = (id: string) => {
    if (id.startsWith('job-')) {
      navigate(`/lounge/jobs/${id}?apply=true`);
    } else {
      alert('Application feature is coming soon.');
    }
  };

  const handleViewJob = (id: string) => {
    navigate(`/lounge/jobs/${id}`);
  };

  const filteredJobs = useMemo(() => {
    let filtered = allJobs.filter(job => {
      if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !job.company.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortType) {
        case 'By Match Score':
          return b.aiMatch - a.aiMatch;
        case 'By Deadline':
          return 0; // TODO: Sort by actual deadline
        case 'Latest':
          return 0; // TODO: Sort by actual registration date
        case 'Popular':
          return 0; // TODO: Sort by actual popularity
        default:
          return 0;
      }
    });

    return sorted;
  }, [searchQuery, sortType]);

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
        {/* AI Radar Active Header */}
        <div style={{
          background: 'linear-gradient(to right, #0F172A, #1E293B)',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2.5rem',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '256px',
            height: '256px',
            background: '#3B82F6',
            borderRadius: '50%',
            filter: 'blur(96px)',
            opacity: 0.2,
            transform: 'translate(80px, -80px)'
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              color: '#93C5FD',
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <i className="fa-solid fa-bolt"></i> AI Radar Active
            </div>
            <h1 style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: isDesktop ? '2.25rem' : '1.875rem',
              fontWeight: 700,
              margin: 0,
              marginBottom: '1rem'
            }}>
              <>We found <span style={{
                background: 'linear-gradient(to right, #60A5FA, #A855F7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>12 High-Match</span> Opportunities.</>
            </h1>
            <p style={{
              color: '#CBD5E1',
              maxWidth: '42rem',
              marginBottom: '1.5rem',
              fontSize: isDesktop ? '1rem' : '0.875rem'
            }}>
              Based on your profile (React, Python, AWS), these positions offer the highest probability of acceptance and career growth.
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button style={{
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              >
                <i className="fa-solid fa-briefcase" style={{ color: '#60A5FA' }}></i> Full-time
              </button>
              <button style={{
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              >
                <i className="fa-solid fa-trophy" style={{ color: '#FBBF24' }}></i> Hackathons
              </button>
              <button style={{
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              >
                <i className="fa-solid fa-graduation-cap" style={{ color: '#34D399' }}></i> Education
              </button>
              <button style={{
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              >
                <i className="fa-solid fa-globe" style={{ color: '#A855F7' }}></i> Remote Only
              </button>
            </div>
          </div>
        </div>

        {/* Top Picks for You */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <h2 style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#0F172A',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <i className="fa-solid fa-star" style={{ color: '#FBBF24' }}></i> Top Picks for You
            </h2>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr',
            gap: '1.5rem'
          }}>
            {recommendedJobs.map((job) => {
              const isUrgent = job.deadline?.startsWith('D-') && parseInt(job.deadline.replace('D-', '')) <= 3
              const borderColor = job.matchRate >= 90 ? '#2563EB' : job.isHackathon ? '#059669' : '#9333EA'
              
              return (
                <div
                  key={job.id}
                  style={{
                    background: 'white',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    border: `1px solid ${borderColor === '#2563EB' ? '#BFDBFE' : borderColor === '#059669' ? '#A7F3D0' : '#E9D5FF'}`,
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0, 0, 0, 0.05)'
                    e.currentTarget.style.borderColor = '#60A5FA'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                    e.currentTarget.style.borderColor = borderColor === '#2563EB' ? '#BFDBFE' : borderColor === '#059669' ? '#A7F3D0' : '#E9D5FF'
                  }}
                  onClick={() => handleViewJob(job.id)}
                >
                  {/* Left Border */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    background: borderColor
                  }}></div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    {/* Company Logo */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: '#F9FAFB',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.5rem',
                      border: '1px solid #F3F4F6'
                    }}>
                      {job.logo ? (
                        <img src={job.logo} alt={job.company} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : job.isStartup ? (
                        <i className="fa-solid fa-rocket" style={{ color: '#9333EA', fontSize: '1.25rem' }}></i>
                      ) : (
                        <span style={{ color: job.isHackathon ? '#059669' : '#9333EA', fontWeight: 700, fontSize: '1.25rem' }}>
                          {job.company.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Match Score Ring */}
                    <div style={{
                      position: 'relative',
                      width: '48px',
                      height: '48px'
                    }}>
                      <div style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background: `conic-gradient(${borderColor} ${job.matchRate}%, #E2E8F0 0)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute',
                          width: '38px',
                          height: '38px',
                          background: 'white',
                          borderRadius: '50%'
                        }}></div>
                        <span style={{
                          position: 'relative',
                          zIndex: 10,
                          fontSize: '12px',
                          fontWeight: 800,
                          color: borderColor
                        }}>
                          {job.matchRate}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 style={{
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    color: '#0F172A',
                    margin: 0,
                    marginBottom: '0.25rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = borderColor
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#0F172A'
                  }}
                  >
                    {job.title}
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#64748B',
                    margin: 0,
                    marginBottom: '1rem'
                  }}>
                    {job.company} • {job.location}
                  </p>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    {job.skills.map((skill, i) => {
                      const isUrgentBadge = isUrgent && i === 0
                      return (
                        <span
                          key={i}
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: isUrgentBadge ? '#FEE2E2' : '#F1F5F9',
                            color: isUrgentBadge ? '#DC2626' : '#475569',
                            fontSize: '10px',
                            fontWeight: isUrgentBadge ? 700 : 600,
                            borderRadius: '0.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            animation: isUrgentBadge ? 'pulse-red 2s infinite' : 'none',
                            boxShadow: isUrgentBadge ? '0 0 0 0 rgba(239, 68, 68, 0.4)' : 'none'
                          }}
                        >
                          {isUrgentBadge && <i className="fa-regular fa-clock"></i>}
                          {skill}
                        </span>
                      )
                    })}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: '#94A3B8'
                  }}>
                    <span>{job.deadline}</span>
                    <span style={{
                      color: borderColor,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleApply(job.id)
                    }}
                    >
                      {job.isHackathon 
                        ? 'Join Team →'
                        : job.isStartup
                        ? 'View Details →'
                        : 'Apply Now →'
                      }
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(12, 1fr)' : '1fr',
          gap: '2rem'
        }}>
          {/* Left Sidebar - Filters */}
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
              <div style={{
                background: 'white',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{
                    fontWeight: 700,
                    color: '#0F172A',
                    margin: 0
                  }}>
                    Filters
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedCategory('Jobs & Internships')
                      setSelectedSkills(new Set(['Python']))
                    }}
                    style={{
                      fontSize: '0.75rem',
                      color: '#2563EB',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    Reset
                  </button>
                </div>
                
                {/* Category */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                    letterSpacing: '0.05em'
                  }}>
                    Category
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                      { key: 'Jobs & Internships', label: 'Jobs & Internships' },
                      { key: 'Hackathons', label: 'Hackathons' },
                      { key: 'Education', label: 'Education' }
                    ].map(category => (
                      <label
                        key={category.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          color: '#475569'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategory === category.key}
                          onChange={() => setSelectedCategory(category.key)}
                          style={{
                            borderRadius: '0.25rem',
                            accentColor: '#2563EB',
                            cursor: 'pointer'
                          }}
                        />
                        <span>{category.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                    letterSpacing: '0.05em'
                  }}>
                    Skills
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {['Python', 'React', 'Node.js'].map(skill => (
                      <span
                        key={skill}
                        onClick={() => {
                          const newSet = new Set(selectedSkills)
                          if (newSet.has(skill)) {
                            newSet.delete(skill)
                          } else {
                            newSet.add(skill)
                          }
                          setSelectedSkills(newSet)
                        }}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: selectedSkills.has(skill) ? '#DBEAFE' : '#F8FAFC',
                          color: selectedSkills.has(skill) ? '#2563EB' : '#475569',
                          fontSize: '0.75rem',
                          borderRadius: '0.25rem',
                          border: selectedSkills.has(skill) ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedSkills.has(skill)) {
                            e.currentTarget.style.background = '#F1F5F9'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedSkills.has(skill)) {
                            e.currentTarget.style.background = '#F8FAFC'
                          }
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Right Content - Latest Postings */}
          <div style={{
            gridColumn: isDesktop ? 'span 9' : 'span 1',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <h3 style={{
                fontWeight: 700,
                color: '#0F172A',
                margin: 0
              }}>
                Latest Postings
              </h3>
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value as SortType)}
                style={{
                  fontSize: '0.875rem',
                  border: 'none',
                  background: 'transparent',
                  color: '#64748B',
                  fontWeight: 500,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="By Match Score">Sort by: Match Score</option>
                <option value="By Deadline">Sort by: Date</option>
                <option value="Latest">Sort by: Latest</option>
                <option value="Popular">Sort by: Popular</option>
              </select>
            </div>

            {filteredJobs.map(job => (
              <div
                key={job.id}
                style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: isDesktop ? 'row' : 'column',
                  alignItems: isDesktop ? 'center' : 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0, 0, 0, 0.05)'
                  e.currentTarget.style.borderColor = '#60A5FA'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = '#E2E8F0'
                }}
                onClick={() => handleViewJob(job.id)}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '0.5rem',
                    background: '#F9FAFB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.5rem',
                    border: '1px solid #F3F4F6'
                  }}>
                    {job.logo ? (
                      <img src={job.logo} alt={job.company} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : job.company === 'Apple' ? (
                      <span style={{ fontSize: '1.5rem' }}>🍎</span>
                    ) : (
                      <span style={{
                        fontSize: '1.125rem',
                        fontWeight: 700,
                        color: '#2563EB'
                      }}>
                        {job.company.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 style={{
                      fontWeight: 700,
                      color: '#0F172A',
                      margin: 0,
                      marginBottom: '0.25rem',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#2563EB'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#0F172A'
                    }}
                    >
                      {job.title}
                    </h4>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#64748B',
                      marginTop: '0.25rem'
                    }}>
                      <span>{job.company}</span>
                      <span style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: '#CBD5E1'
                      }}></span>
                      <span>{job.location}</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  width: isDesktop ? 'auto' : '100%',
                  justifyContent: isDesktop ? 'flex-end' : 'space-between'
                }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {job.skills.slice(0, 2).map((skill, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#F1F5F9',
                          color: '#64748B',
                          fontSize: '0.75rem',
                          borderRadius: '0.25rem'
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#2563EB'
                    }}>
                      {job.aiMatch}% Match
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#94A3B8'
                    }}>
                      {job.deadline}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Add CSS for animations */}
      <style>{`
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
}
