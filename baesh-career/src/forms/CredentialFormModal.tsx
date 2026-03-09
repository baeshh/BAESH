import Modal from '../components/Modal'
import { useState } from 'react'

export default function CredentialFormModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (data: any) => void }) {
  const [title, setTitle] = useState('')
  const [issuer, setIssuer] = useState('')
  const [date, setDate] = useState('')
  return (
    <Modal open={open} onClose={onClose} title="자격/수료 추가">
      <div style={{ display: 'grid', gap: 8 }}>
        <input className="input" placeholder="자격/수료명" value={title} onChange={e=>setTitle(e.target.value)} />
        <input className="input" placeholder="발급기관" value={issuer} onChange={e=>setIssuer(e.target.value)} />
        <input className="input" placeholder="발급일 (YYYY.MM)" value={date} onChange={e=>setDate(e.target.value)} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="badge" onClick={onClose}>취소</button>
          <button className="button" onClick={()=>{ onSave({ title, issuer, date }); onClose(); }}>저장</button>
        </div>
      </div>
    </Modal>
  )
}


