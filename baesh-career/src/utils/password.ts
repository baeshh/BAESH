const COMMON = ['password','123456','qwerty','abc123','letmein','111111','123123']

export function evaluatePassword(pw: string, ctx?: { email?: string; name?: string }) {
  const checks: { label: string; pass: boolean }[] = []
  const hints: string[] = []
  if (!pw) return { score: 0, checks, hints }

  const hasLower = /[a-z]/.test(pw)
  const hasUpper = /[A-Z]/.test(pw)
  const hasDigit = /\d/.test(pw)
  const hasSpecial = /[^A-Za-z0-9]/.test(pw)
  const long8 = pw.length >= 8
  const long12 = pw.length >= 12
  const containsName = !!ctx?.name && pw.toLowerCase().includes(ctx.name.toLowerCase())
  const containsEmail = !!ctx?.email && pw.toLowerCase().includes((ctx.email || '').split('@')[0].toLowerCase())
  const repeated = /(.)\1{2,}/.test(pw)
  const sequential = /(0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|defg|qwerty)/i.test(pw)
  const common = COMMON.some(c => pw.toLowerCase().includes(c))

  checks.push({ label: '8자 이상', pass: long8 })
  checks.push({ label: '대/소문자', pass: hasLower && hasUpper })
  checks.push({ label: '숫자 포함', pass: hasDigit })
  checks.push({ label: '특수문자 포함', pass: hasSpecial })
  checks.push({ label: '개인정보 미포함', pass: !(containsName || containsEmail) })

  if (!long12) hints.push('권장 길이 12자 이상')
  if (!(hasLower && hasUpper)) hints.push('대/소문자 섞기')
  if (!hasDigit) hints.push('숫자 포함')
  if (!hasSpecial) hints.push('특수문자 포함')
  if (containsName || containsEmail) hints.push('이메일/이름 제외')
  if (repeated) hints.push('반복 문자 지양')
  if (sequential) hints.push('연속 문자 지양')
  if (common) hints.push('흔한 비밀번호 지양')

  let score = 0
  score += long8 ? 1 : 0
  score += hasLower && hasUpper ? 1 : 0
  score += hasDigit ? 1 : 0
  score += hasSpecial ? 1 : 0
  score += long12 ? 1 : 0
  score -= containsName || containsEmail ? 1 : 0
  score -= repeated ? 1 : 0
  score -= sequential ? 1 : 0
  if (score < 0) score = 0
  if (score > 5) score = 5

  return { score, checks, hints }
}


