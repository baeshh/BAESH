import Modal from "./Modal";
import { useMemo, useState } from "react";

export default function ApplyModal({
  open,
  onClose,
  programName,
}: {
  open: boolean;
  onClose: () => void;
  programName: string;
}) {
  const [intro, setIntro] = useState("");
  const [motivation, setMotivation] = useState("");
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [aiDraft, setAiDraft] = useState(false);

  const portfolioOptions = [
    "BAESH (AI 클론 플랫폼)",
    "운동판 (운동 매칭)",
    "구공패밀리 (창업)",
    "BILLBOOST (청구 자동화)",
  ];
  const togglePortfolio = (p: string) =>
    setPortfolio((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );

  const canSubmit = useMemo(
    () =>
      intro.trim().length >= 10 &&
      motivation.trim().length >= 10 &&
      portfolio.length > 0 &&
      phone.length >= 10 &&
      email.includes("@") &&
      agree,
    [intro, motivation, portfolio, phone, email, agree]
  );

  const loadAIDraft = () => {
    setAiDraft(true);
    setIntro(
      "안녕하세요. 저는 AI와 데이터를 활용한 창업에 관심이 많은 배승환입니다. 경일대학교 클라우드컴퓨팅전공 재학 중이며, BAESH, 운동판 등 다수의 프로젝트를 리딩한 경험이 있습니다."
    );
    setMotivation(
      "포항TP의 AI 창업 인큐베이팅 프로그램을 통해 기술 기반 창업 역량을 강화하고, 실전 사업화 경험을 쌓고자 지원합니다. 특히 데이터 기반 의사결정과 AI 서비스 설계 역량을 심화하고 싶습니다."
    );
    setPortfolio(["BAESH (AI 클론 플랫폼)", "운동판 (운동 매칭)"]);
  };

  const handleSubmit = () => {
    alert(
      `지원 완료!\n프로그램: ${programName}\n선택 포트폴리오: ${portfolio.join(
        ", "
      )}\n\n기관 승인 후 알림을 보내드립니다.`
    );
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={`지원하기 · ${programName}`}>
      <div style={{ display: "grid", gap: 16 }}>
        {/* AI Draft Section */}
        <div
          className="panel"
          style={{
            padding: 12,
            background:
              "linear-gradient(135deg, rgba(30,111,255,0.05), rgba(64,140,255,0.05))",
            border: "1px solid rgba(30,111,255,0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              className="button"
              onClick={loadAIDraft}
              disabled={aiDraft}
              style={{ fontSize: 13, height: 36 }}
            >
              ✨ AI 추천 지원서 불러오기
            </button>
            {aiDraft && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 18 }}>✅</span>
                <span
                  className="helper"
                  style={{ fontSize: 12, color: "var(--brand)" }}
                >
                  초안이 생성되었습니다. 수정 후 제출하세요.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Self Introduction */}
        <div className="field">
          <label
            style={{
              fontWeight: 600,
              fontSize: 14,
              marginBottom: 6,
              display: "block",
            }}
          >
            ✏️ 자기소개{" "}
            <span style={{ color: "var(--error)", fontSize: 12 }}>*</span>
          </label>
          <textarea
            className="input"
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            style={{
              minHeight: 120,
              marginTop: 4,
              resize: "vertical",
              lineHeight: 1.6,
              width: "100%",
            }}
          />
          {!intro && (
            <div className="helper" style={{ fontSize: 11, marginTop: 4 }}>
              예: 저는 AI와 데이터를 활용한 창업에 관심이 많은 배승환입니다.
              경일대학교 클라우드컴퓨팅전공 재학 중이며...
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            <span
              className="helper"
              style={{
                fontSize: 11,
                color: intro.length < 10 ? "var(--error)" : "var(--muted)",
              }}
            >
              {intro.length < 10
                ? `최소 10자 이상 입력해주세요 (현재 ${intro.length}자)`
                : "✓ 입력 완료"}
            </span>
            <span className="helper" style={{ fontSize: 11 }}>
              {intro.length}/500자
            </span>
          </div>
        </div>

        {/* Motivation */}
        <div className="field">
          <label
            style={{
              fontWeight: 600,
              fontSize: 14,
              marginBottom: 6,
              display: "block",
            }}
          >
            💡 지원 동기{" "}
            <span style={{ color: "var(--error)", fontSize: 12 }}>*</span>
          </label>
          <textarea
            className="input"
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            style={{
              minHeight: 120,
              marginTop: 4,
              resize: "vertical",
              lineHeight: 1.6,
              width: "100%",
            }}
          />
          {!motivation && (
            <div className="helper" style={{ fontSize: 11, marginTop: 4 }}>
              예: 포항TP의 AI 창업 인큐베이팅 프로그램을 통해 기술 기반 창업
              역량을 강화하고, 실전 사업화 경험을 쌓고자 지원합니다...
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            <span
              className="helper"
              style={{
                fontSize: 11,
                color: motivation.length < 10 ? "var(--error)" : "var(--muted)",
              }}
            >
              {motivation.length < 10
                ? `최소 10자 이상 입력해주세요 (현재 ${motivation.length}자)`
                : "✓ 입력 완료"}
            </span>
            <span className="helper" style={{ fontSize: 11 }}>
              {motivation.length}/500자
            </span>
          </div>
        </div>

        {/* Portfolio Selection */}
        <div className="field">
          <label
            style={{
              fontWeight: 600,
              fontSize: 14,
              marginBottom: 6,
              display: "block",
            }}
          >
            📂 포트폴리오 선택{" "}
            <span style={{ color: "var(--error)", fontSize: 12 }}>*</span>
          </label>
          <div className="helper" style={{ fontSize: 12, marginBottom: 12 }}>
            .
          </div>
          <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
            {portfolioOptions.map((p) => (
              <label
                key={p}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 18px",
                  borderRadius: 12,
                  border: "1px solid",
                  borderColor: portfolio.includes(p)
                    ? "var(--brand)"
                    : "var(--border)",
                  background: portfolio.includes(p)
                    ? "rgba(30,111,255,0.08)"
                    : "#FAFAFA",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <input
                  type="checkbox"
                  checked={portfolio.includes(p)}
                  onChange={() => togglePortfolio(p)}
                  style={{
                    width: 20,
                    height: 20,
                    cursor: "pointer",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: portfolio.includes(p) ? 600 : 400,
                    color: portfolio.includes(p)
                      ? "var(--brand)"
                      : "var(--text)",
                    lineHeight: 1.5,
                  }}
                >
                  {p}
                </span>
              </label>
            ))}
          </div>
          {portfolio.length === 0 && (
            <div
              className="helper"
              style={{ fontSize: 11, color: "var(--error)", marginTop: 4 }}
            >
              최소 1개 이상 선택해주세요
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div style={{ display: "grid", gap: 12 }}>
          <div className="field">
            <label
              style={{
                fontWeight: 600,
                fontSize: 14,
                marginBottom: 6,
                display: "block",
              }}
            >
              📧 이메일{" "}
              <span style={{ color: "var(--error)", fontSize: 12 }}>*</span>
            </label>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ height: 44 }}
            />
            {!email && (
              <div className="helper" style={{ fontSize: 11, marginTop: 4 }}>
                예: example@email.com
              </div>
            )}
            {email && !email.includes("@") && (
              <div
                className="helper"
                style={{ fontSize: 11, color: "var(--error)", marginTop: 4 }}
              >
                올바른 이메일 형식을 입력해주세요
              </div>
            )}
          </div>
          <div className="field">
            <label
              style={{
                fontWeight: 600,
                fontSize: 14,
                marginBottom: 6,
                display: "block",
              }}
            >
              📱 휴대폰 번호{" "}
              <span style={{ color: "var(--error)", fontSize: 12 }}>*</span>
            </label>
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ height: 44 }}
            />
            {!phone && (
              <div className="helper" style={{ fontSize: 11, marginTop: 4 }}>
                예: 010-1234-5678
              </div>
            )}
            {phone && phone.length < 10 && (
              <div
                className="helper"
                style={{ fontSize: 11, color: "var(--error)", marginTop: 4 }}
              >
                올바른 휴대폰 번호를 입력해주세요
              </div>
            )}
          </div>
        </div>

        {/* Consent */}
        <div
          className="panel"
          style={{
            padding: 12,
            background: "#F8FAFC",
            border: "1px solid var(--border)",
          }}
        >
          <label
            className="checkbox-container"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              className="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              style={{ marginTop: 2 }}
            />
            <span className="checkbox-custom" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                [필수] 개인정보 수집 및 이용 동의
              </div>
              <div className="helper" style={{ fontSize: 11, lineHeight: 1.5 }}>
                지원서 제출을 위해 입력하신 개인정보(이름, 이메일, 휴대폰 번호,
                포트폴리오)가 프로그램 운영 기관에 공유됩니다.
              </div>
            </div>
          </label>
        </div>

        {/* Submit Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            marginTop: 8,
            paddingTop: 16,
            borderTop: "1px solid var(--border)",
          }}
        >
          <button
            className="badge"
            onClick={onClose}
            style={{ height: 44, padding: "0 20px", fontSize: 14 }}
          >
            취소
          </button>
          <button
            className="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              height: 44,
              padding: "0 32px",
              fontSize: 14,
              fontWeight: 600,
              opacity: canSubmit ? 1 : 0.5,
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            제출하기 ▶
          </button>
        </div>
      </div>
    </Modal>
  );
}
