export function formatKR(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('02')) {
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0,2)}-${digits.slice(2)}`
    if (digits.length <= 9) return `${digits.slice(0,2)}-${digits.slice(2, digits.length-4)}-${digits.slice(-4)}`
    return `${digits.slice(0,2)}-${digits.slice(2,6)}-${digits.slice(6,10)}`
  }
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0,3)}-${digits.slice(3)}`
  return `${digits.slice(0,3)}-${digits.slice(3, digits.length-4)}-${digits.slice(-4)}`
}

export function isValidKR(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return /^01[016789]\d{7,8}$/.test(digits)
}


