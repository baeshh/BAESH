import Modal from '../components/Modal'
import { useState } from 'react'

export default function AwardFormModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (data: any) => void }) {
  const [title, setTitle] = useState('')
  const [event, setEvent] = useState('')
  const [date, setDate] = useState('')
  return (
    <Modal open={open} onClose={onClose} title="수상/성과 추가">
      <div style={{ display: 'grid', gap: 8 }}>
        <input className="input" placeholder="수상/성과명" value={title} onChange={e=>setTitle(e.target.value)} />
        <input className="input" placeholder="대회/기관" value={event} onChange={e=>setEvent(e.target.value)} />
        <input className="input" placeholder="시점 (YYYY.MM)" value={date} onChange={e=>setDate(e.target.value)} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="badge" onClick={onClose}>취소</button>
          <button className="button" onClick={()=>{ onSave({ title, event, date }); onClose(); }}>저장</button>
        </div>
      </div>
    </Modal>
  )
}


