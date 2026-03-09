import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'
import { AuthProvider } from './auth/AuthContext'
import './i18n/config'

// Force light theme globally
try {
  localStorage.removeItem('baesh-theme')
  document.documentElement.setAttribute('data-theme', 'light')
} catch {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
)
