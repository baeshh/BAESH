import Modal from '../components/Modal'
import { useState } from 'react'

export default function PortfolioFormModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (data: any) => void }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [stack, setStack] = useState('')
  const [period, setPeriod] = useState('')
  return (
    <Modal open={open} onClose={onClose} title="프로젝트/포트폴리오 추가">
      <div style={{ display: 'grid', gap: 8 }}>
        <input className="input" placeholder="프로젝트명" value={name} onChange={e=>setName(e.target.value)} />
        <input className="input" placeholder="역할" value={role} onChange={e=>setRole(e.target.value)} />
        <input className="input" placeholder="기술스택" value={stack} onChange={e=>setStack(e.target.value)} />
        <input className="input" placeholder="기간" value={period} onChange={e=>setPeriod(e.target.value)} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="badge" onClick={onClose}>취소</button>
          <button className="button" onClick={()=>{ onSave({ name, role, stack, period }); onClose(); }}>저장</button>
        </div>
      </div>
    </Modal>
  )
}


