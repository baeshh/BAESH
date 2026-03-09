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

interface RecommendedJobCardProps {
  id: string;
  title: string;
  company: string;
  position: string;
  matchRate: number;
  skills: string[];
  summary: string;
  deadline: string;
  logo?: string;
  onApply?: (id: string) => void;
}

export default function RecommendedJobCard({
  id,
  title,
  company,
  position,
  matchRate,
  skills,
  summary,
  deadline,
  logo,
  onApply,
}: RecommendedJobCardProps) {
  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onApply?.(id);
  };

  return (
    <Link to={`/lounge/jobs/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="panel" style={{ 
        padding: 12, 
        cursor: 'pointer',
        background: 'linear-gradient(135deg, rgba(30, 111, 255, 0.05) 0%, rgba(64, 140, 255, 0.05) 100%)',
        border: '1.5px solid rgba(30, 111, 255, 0.2)',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 12px -4px rgba(30, 111, 255, 0.25)';
        e.currentTarget.style.borderColor = 'rgba(30, 111, 255, 0.35)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'rgba(30, 111, 255, 0.2)';
      }}
      >
        {/* AI 매칭률 배지 (작게) */}
        <div style={{ 
          position: 'absolute',
          top: 10,
          right: 10,
          padding: '4px 8px',
          background: 'linear-gradient(135deg, var(--brand), var(--accent))',
          borderRadius: 6,
          color: 'white',
          fontSize: 10,
          fontWeight: 700,
          boxShadow: '0 2px 8px rgba(30, 111, 255, 0.3)'
        }}>
          AI {matchRate}%
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {/* 회사 로고 (작게) */}
          <CompanyLogo 
            logo={logo} 
            company={company}
            size={40}
          />

          {/* 공고 정보 */}
          <div style={{ flex: 1, minWidth: 0, paddingRight: 70 }}>
            {/* 제목 */}
            <h3 style={{ 
              margin: '0 0 4px 0', 
              fontSize: 15, 
              fontWeight: 700,
              lineHeight: 1.3
            }}>
              {title}
            </h3>

            {/* 기업명 + 포지션 */}
            <div style={{ 
              fontSize: 12, 
              color: 'var(--muted)', 
              marginBottom: 6 
            }}>
              {company} · {position}
            </div>

            {/* 포지션 세부 요약 (한 줄, 작게) */}
            <p style={{ 
              fontSize: 11, 
              lineHeight: 1.4, 
              color: 'var(--text)',
              margin: '0 0 6px 0',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {summary}
            </p>

            {/* 핵심 기술 스택 (작게) */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 4, 
              marginBottom: 0
            }}>
              {skills.slice(0, 4).map(skill => (
                <span key={skill} className="chip" style={{ 
                  fontSize: 10,
                  padding: '2px 6px',
                  background: 'rgba(30, 111, 255, 0.1)',
                  color: 'var(--brand)',
                  borderColor: 'rgba(30, 111, 255, 0.2)'
                }}>
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

