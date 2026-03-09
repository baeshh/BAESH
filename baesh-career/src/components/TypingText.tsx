import { useEffect, useState } from 'react'

export default function TypingText({ text, speed = 30 }: { text: string; speed?: number }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    setIdx(0)
    const id = setInterval(() => setIdx(i => (i < text.length ? i + 1 : i)), speed)
    return () => clearInterval(id)
  }, [text, speed])
  return <span aria-live="polite">{text.slice(0, idx)}<span style={{ opacity: 0.4 }}>|</span></span>
}


