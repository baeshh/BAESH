import Modal from '../components/Modal'
import { useState } from 'react'

export default function VerificationModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (data: any) => void }) {
  const [org, setOrg] = useState('')
  const [evidence, setEvidence] = useState('')
  const [message, setMessage] = useState('')
  return (
    <Modal open={open} onClose={onClose} title="인증 요청">
      <div style={{ display: 'grid', gap: 8 }}>
        <input className="input" placeholder="기관명" value={org} onChange={e=>setOrg(e.target.value)} />
        <input className="input" placeholder="증빙 URL (또는 설명)" value={evidence} onChange={e=>setEvidence(e.target.value)} />
        <input className="input" placeholder="메시지(선택)" value={message} onChange={e=>setMessage(e.target.value)} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="badge" onClick={onClose}>취소</button>
          <button className="button" onClick={()=>{ onSubmit({ org, evidence, message }); onClose(); }}>요청 보내기</button>
        </div>
      </div>
    </Modal>
  )
}


