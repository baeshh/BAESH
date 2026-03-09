import { useEffect, useState } from 'react'

const THEME_KEY = 'baesh-theme'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem(THEME_KEY) as any) || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  return (
    <button className="badge" aria-label="toggle theme" onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}>
      {theme === 'dark' ? '라이트' : '다크'}
    </button>
  )
}


