import Modal from '../components/Modal'
import { useState } from 'react'

export default function CareerFormModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (data: any) => void }) {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [period, setPeriod] = useState('')
  return (
    <Modal open={open} onClose={onClose} title="경력 추가">
      <div style={{ display: 'grid', gap: 8 }}>
        <input className="input" placeholder="회사/기관" value={company} onChange={e=>setCompany(e.target.value)} />
        <input className="input" placeholder="역할/직무" value={role} onChange={e=>setRole(e.target.value)} />
        <input className="input" placeholder="기간 (예: 2024.01~2025.03)" value={period} onChange={e=>setPeriod(e.target.value)} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="badge" onClick={onClose}>취소</button>
          <button className="button" onClick={()=>{ onSave({ company, role, period }); onClose(); }}>저장</button>
        </div>
      </div>
    </Modal>
  )
}


