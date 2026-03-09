import Modal from './Modal'

export default function ConsentModal({ open, onClose, onAccept }: { open: boolean; onClose: () => void; onAccept: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="약관 동의">
      <p style={{ color: 'var(--muted)' }}>요약: 서비스 이용약관, 개인정보 수집·이용에 동의가 필요합니다. 전체 약관은 아래 버튼으로 확인할 수 있습니다.</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
        <button className="badge" onClick={onClose}>전체 보기</button>
        <button className="button" onClick={onAccept}>동의</button>
      </div>
    </Modal>
  )
}


