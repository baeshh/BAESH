import { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import { useTranslation } from 'react-i18next'

interface ProjectFormData {
  title: string
  description: string
  type: string
  startDate: string
  endDate: string | null
  isOngoing: boolean
  tags: string[]
  status: 'idea' | 'inProgress' | 'completed' | 'paused'
}

interface ProjectFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: ProjectFormData) => void
  initialData?: Partial<ProjectFormData>
}

export default function ProjectFormModal({ open, onClose, onSave, initialData }: ProjectFormModalProps) {
  const { t, i18n } = useTranslation()
  const isEnglish = i18n.language === 'en'
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('sideProject')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isOngoing, setIsOngoing] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [status, setStatus] = useState<'idea' | 'inProgress' | 'completed' | 'paused'>('idea')

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '')
      setDescription(initialData.description || '')
      setType(initialData.type || 'sideProject')
      setStartDate(initialData.startDate || '')
      setEndDate(initialData.endDate || '')
      setIsOngoing(initialData.isOngoing || false)
      setTags(initialData.tags || [])
      setStatus(initialData.status || 'idea')
    } else {
      // 새 프로젝트인 경우 오늘 날짜를 기본값으로 설정
      const today = new Date().toISOString().split('T')[0]
      setStartDate(today)
    }
  }, [initialData, open])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !startDate) {
      alert(isEnglish ? 'Please fill in all required fields' : '필수 항목을 모두 입력해주세요')
      return
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      type,
      startDate,
      endDate: isOngoing ? null : endDate || null,
      isOngoing,
      tags,
      status
    })
    
    // 폼 초기화
    setTitle('')
    setDescription('')
    setType('sideProject')
    setStartDate('')
    setEndDate('')
    setIsOngoing(false)
    setTags([])
    setTagInput('')
    setStatus('idea')
  }

  const projectTypes = [
    { value: 'contest', label: { ko: '공모전', en: 'Contest' } },
    { value: 'sideProject', label: { ko: '사이드 프로젝트', en: 'Side Project' } },
    { value: 'startup', label: { ko: '스타트업', en: 'Startup' } },
    { value: 'research', label: { ko: '연구', en: 'Research' } },
    { value: 'hackathon', label: { ko: '해커톤', en: 'Hackathon' } },
    { value: 'other', label: { ko: '기타', en: 'Other' } }
  ]

  const statuses = [
    { value: 'idea', label: { ko: '아이디어', en: 'Idea' } },
    { value: 'inProgress', label: { ko: '진행 중', en: 'In Progress' } },
    { value: 'completed', label: { ko: '마무리', en: 'Completed' } },
    { value: 'paused', label: { ko: '중단', en: 'Paused' } }
  ]

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      title={initialData ? (isEnglish ? 'Edit Project' : '프로젝트 수정') : (isEnglish ? 'Create New Project' : '새 프로젝트 만들기')}
      style={{ maxWidth: 700, width: '90vw' }}
    >
      <div style={{ display: 'grid', gap: 20, maxHeight: '75vh', overflowY: 'auto', paddingTop: 8 }}>
        {/* 프로젝트 제목 */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
            {t('projects.projectTitle')} <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <input
            className="input"
            placeholder={isEnglish ? 'Enter project title' : '프로젝트 제목을 입력하세요'}
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* 한 줄 설명 */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
            {t('projects.description')} <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <textarea
            className="input"
            placeholder={isEnglish ? 'Describe the problem this project solves' : '이 프로젝트가 해결하는 문제를 설명하세요'}
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ minHeight: 120, resize: 'vertical', padding: '12px', lineHeight: 1.5 }}
          />
        </div>

        {/* 프로젝트 유형 */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
            {t('projects.projectType')}
          </label>
          <select className="input" value={type} onChange={e => setType(e.target.value)}>
            {projectTypes.map(pt => (
              <option key={pt.value} value={pt.value}>
                {isEnglish ? pt.label.en : pt.label.ko}
              </option>
            ))}
          </select>
        </div>

        {/* 기간 */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
            {t('projects.period')}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center' }}>
            <div>
              <label className="helper" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>
                {t('projects.startDate')}
              </label>
              <input
                type="date"
                className="input"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <span style={{ marginTop: 20 }}>~</span>
            <div>
              <label className="helper" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>
                {t('projects.endDate')}
              </label>
              <input
                type="date"
                className="input"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                disabled={isOngoing}
              />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <input
              type="checkbox"
              checked={isOngoing}
              onChange={e => setIsOngoing(e.target.checked)}
            />
            <span className="helper" style={{ fontSize: 13 }}>{t('projects.ongoing')}</span>
          </label>
        </div>

        {/* 진행 현황 */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
            {t('projects.status')}
          </label>
          <select className="input" value={status} onChange={e => setStatus(e.target.value as any)}>
            {statuses.map(s => (
              <option key={s.value} value={s.value}>
                {isEnglish ? s.label.en : s.label.ko}
              </option>
            ))}
          </select>
        </div>

        {/* 태그 */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
            {t('projects.tags')}
          </label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              className="input"
              placeholder={isEnglish ? 'Add tag (e.g., AI, Frontend)' : '태그 추가 (예: AI, 프론트엔드)'}
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
              style={{ flex: 1 }}
            />
            <button className="badge" onClick={handleAddTag}>
              {t('projects.addTag')}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {tags.map(tag => (
              <span key={tag} className="chip" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: 14,
                    color: 'var(--muted)'
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <button className="badge" onClick={onClose} style={{ padding: '10px 20px', fontSize: 14 }}>
            {t('projects.cancel')}
          </button>
          <button className="button" onClick={handleSubmit} style={{ padding: '10px 24px', fontSize: 14 }}>
            {t('projects.save')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
