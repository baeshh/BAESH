import Modal from './Modal'

export default function ReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Weekly Growth Report">
      <div style={{ display: 'grid', gap: 8 }}>
        <div className="panel" style={{ padding: 12 }}>
          <strong>이번 주 요약</strong>
          <ul>
            <li>총 활동: 7건 (라운지 2, 네트워킹 3, 인증 2)</li>
            <li>핵심 성장: ‘데이터 분석’ 역량 +14%</li>
            <li>다음 주 제안: 시각화 챌린지 참여</li>
          </ul>
        </div>
        <div className="panel" style={{ padding: 12 }}>
          <strong>성장 트렌드</strong>
          <p style={{ color: 'var(--muted)' }}>날짜별 그래프(차트 라이브러리 연동 예정)</p>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="badge" onClick={onClose}>닫기</button>
          <button className="button">PDF로 내보내기</button>
        </div>
      </div>
    </Modal>
  )
}


