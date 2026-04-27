import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AppLayout from './layouts/AppLayout'
import CloneHub from './pages/CloneHub'
import Profile from './pages/Profile'
import Lounge from './pages/Lounge'
import Networking from './pages/Networking'
import JobDetail from './pages/JobDetail'
import MatchingResults from './pages/MatchingResults'
import MyApplications from './pages/MyApplications'
import CompanyProfile from './pages/CompanyProfile'
import Notifications from './pages/Notifications'
import RequireAuth from './components/RequireAuth'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Preview from './pages/Preview'
import SignupComplete from './pages/SignupComplete'
import Forgot from './pages/Forgot'
import ResetPassword from './pages/ResetPassword'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import UserProgramParticipation from './pages/UserProgramParticipation'
import InstitutionLogin from './pages/institution/InstitutionLogin'
import InstitutionSignup from './pages/institution/InstitutionSignup'
import InstitutionDashboard from './pages/institution/InstitutionDashboard'
import InstitutionProgramForm from './pages/institution/InstitutionProgramForm'
import InstitutionProfile from './pages/institution/InstitutionProfile'
import InstitutionProgramOps from './pages/institution/InstitutionProgramOps'
import { useInstitutionAuth } from './auth/InstitutionAuthContext'
import { useAuth } from './auth/AuthContext'

function RequireInstitution({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useInstitutionAuth()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/institution/login" replace state={{ from: location }} />
  }
  return <>{children}</>
}

function RequireAnyAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated: isUser } = useAuth()
  const { isAuthenticated: isInst } = useInstitutionAuth()
  const location = useLocation()
  if (!isUser && !isInst) {
    return <Navigate to="/" replace state={{ from: location }} />
  }
  return <>{children}</>
}

export function RouterProvider() {
  return (
    <Routes>
      {/* 공개 경로 */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/preview" element={<Preview />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/institution/login" element={<InstitutionLogin />} />
      <Route path="/institution/signup" element={<InstitutionSignup />} />

      {/* 보호 경로: 일반 유저 로그인 후 접근 */}
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/signup/complete" element={<SignupComplete />} />
        <Route path="/clone" element={<CloneHub />} />
        <Route path="/hub" element={<CloneHub />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId" element={<ProjectDetail />} />
        <Route path="/lounge" element={<Lounge />} />
        <Route path="/lounge/jobs/:id" element={<JobDetail />} />
        <Route path="/lounge/matching" element={<MatchingResults />} />
        <Route path="/lounge/applications" element={<MyApplications />} />
        <Route path="/programs/:programId/participate" element={<UserProgramParticipation />} />
        <Route path="/lounge/activities/:id" element={<JobDetail />} />
        <Route path="/networking" element={<Networking />} />
        <Route path="/companies/:id" element={<CompanyProfile />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      {/* 보호 경로: 기관 로그인 후 접근 */}
      <Route element={<RequireInstitution><AppLayout /></RequireInstitution>}>
        <Route path="/institution/dashboard" element={<InstitutionDashboard />} />
        <Route path="/institution/profile" element={<InstitutionProfile />} />
        <Route path="/institution/programs/new" element={<InstitutionProgramForm />} />
        <Route path="/institution/programs/:programId/edit" element={<InstitutionProgramForm />} />
        <Route path="/institution/programs/:programId/ops" element={<InstitutionProgramOps />} />
      </Route>
    </Routes>
  )
}

export function Nav() {
  const { t } = useTranslation()
  const items = [
    { to: '/hub', label: t('common.clone') },
    { to: '/profile', label: t('common.profile') },
    { to: '/lounge', label: t('common.lounge') },
    { to: '/networking', label: t('common.networking') },
  ]
  return (
    <nav className="nav">
      {items.map(i => (
        <NavLink key={i.to} to={i.to} className={({ isActive }) => isActive ? 'active' : ''}>
          {i.label}
        </NavLink>
      ))}
    </nav>
  )
}


