export const DISPOSABLE = new Set([
  'mailinator.com',
  '10minutemail.com',
  'guerrillamail.com',
  'temp-mail.org',
  'yopmail.com',
  'discard.email',
  'trashmail.com',
])

export function isDisposableEmail(email: string) {
  const parts = email.split('@')
  if (parts.length !== 2) return false
  const domain = parts[1].toLowerCase()
  return DISPOSABLE.has(domain)
}


