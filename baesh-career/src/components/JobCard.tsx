import { Link } from 'react-router-dom';
import { useState } from 'react';

// 회사 로고 컴포넌트
function CompanyLogo({ logo, company, size = 40 }: { logo?: string; company: string; size?: number }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 8,
      background: logo && !imageError ? 'white' : 'linear-gradient(135deg, var(--brand), var(--accent))',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      flexShrink: 0,
      display: 'grid',
      placeItems: 'center',
      color: 'white',
      fontWeight: 700,
      fontSize: size * 0.4,
      border: logo && !imageError ? '1px solid var(--border)' : 'none',
      overflow: 'hidden'
    }}>
      {logo && !imageError ? (
        <img 
          src={logo} 
          alt={company}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            padding: 4
          }}
          onError={() => setImageError(true)}
        />
      ) : (
        company.charAt(0)
      )}
    </div>
  );
}

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  position: string;
  skills: string[];
  experience: '신입' | '주니어' | '경력';
  type: '정규직' | '프로젝트' | '공모전' | '인턴';
  location: string;
  deadline: string;
  isBookmarked?: boolean;
  onBookmark?: (id: string) => void;
  aiMatch?: number;
  logo?: string;
}

export default function JobCard({
  id,
  title,
  company,
  position,
  skills,
  experience,
  type,
  location,
  deadline,
  isBookmarked = false,
  onBookmark,
  aiMatch,
  logo,
}: JobCardProps) {
  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmark?.(id);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '정규직':
        return { bg: 'rgba(30, 111, 255, 0.1)', color: 'var(--brand)' };
      case '프로젝트':
        return { bg: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' };
      case '공모전':
        return { bg: 'rgba(236, 72, 153, 0.1)', color: '#EC4899' };
      case '인턴':
        return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' };
      default:
        return { bg: 'var(--border)', color: 'var(--muted)' };
    }
  };

  const typeStyle = getTypeColor(type);

  return (
    <Link to={`/lounge/jobs/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="panel" style={{ 
        padding: 12, 
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 12px -4px rgba(30, 111, 255, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      >
        {/* 북마크 버튼 */}
        <button
          onClick={handleBookmark}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 16,
            padding: 2,
            color: isBookmarked ? '#F59E0B' : 'var(--muted)',
            transition: 'all 0.2s ease'
          }}
        >
          {isBookmarked ? '★' : '☆'}
        </button>

        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {/* 회사 로고 (작게) */}
          <CompanyLogo 
            logo={logo} 
            company={company}
            size={40}
          />

          {/* 공고 정보 */}
          <div style={{ flex: 1, minWidth: 0, paddingRight: 30 }}>
            {/* 제목과 AI 매칭률 한 줄 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: 15, 
                fontWeight: 600,
                lineHeight: 1.3,
                flex: 1,
                minWidth: 0
              }}>
                {title}
              </h3>
              {aiMatch && (
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 3, 
                  padding: '2px 6px',
                  background: 'rgba(30, 111, 255, 0.1)',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 600,
                  color: 'var(--brand)',
                  whiteSpace: 'nowrap'
                }}>
                  <span>✨</span>
                  <span>{aiMatch}%</span>
                </div>
              )}
            </div>

            {/* 기업명 + 포지션 + 메타 정보 한 줄 */}
            <div style={{ 
              fontSize: 12, 
              color: 'var(--muted)', 
              marginBottom: 6,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 500 }}>{company}</span>
              <span>·</span>
              <span>{position}</span>
              <span>·</span>
              <span className="badge" style={{ 
                ...typeStyle, 
                fontSize: 10,
                border: 'none',
                padding: '2px 6px'
              }}>
                {type}
              </span>
              <span>·</span>
              <span>{experience}</span>
              <span>·</span>
              <span style={{ color: deadline.includes('D-') ? '#DC2626' : 'inherit', fontWeight: 500 }}>
                마감 {deadline}
              </span>
            </div>

            {/* 스킬 태그 (한 줄, 작게) */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 4, 
              marginBottom: 0
            }}>
              {skills.slice(0, 4).map(skill => (
                <span key={skill} className="chip" style={{ fontSize: 10, padding: '2px 6px' }}>
                  {skill}
                </span>
              ))}
              {skills.length > 4 && (
                <span className="chip" style={{ fontSize: 10, color: 'var(--muted)', padding: '2px 6px' }}>
                  +{skills.length - 4}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

