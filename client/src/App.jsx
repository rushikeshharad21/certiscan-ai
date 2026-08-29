import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuth from './hooks/useAuth.js'
import StudentLayout from './layouts/StudentLayout.jsx'
import AdminLayout from "./layouts/AdminLayout.jsx"

const MyDocuments = lazy(() => import('./pages/student/MyDocuments.jsx'))

const Login = lazy(() => import('./pages/auth/Login.jsx'))
const Register = lazy(() => import('./pages/auth/Register.jsx'))
const Dashboard = lazy(() => import('./pages/student/Dashboard.jsx'))
const UploadDocuments = lazy(() => import('./pages/student/UploadDocument.jsx'))
const Profile = lazy(() => import('./pages/student/Profile.jsx'))

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard.jsx'))
const PendingVerifications = lazy(() => import('./pages/admin/PendingVerifications.jsx'))
const AllDocuments = lazy(() => import('./pages/admin/AllDocuments.jsx'))
const Students = lazy(() => import('./pages/admin/Students.jsx'))
const Reports = lazy(() => import("./pages/admin/Reports"))
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
    </div>
  )
}

function getHomeRoute(user) {
  if (!user) return '/login'
  if (user.role === 'admin') return '/admin/dashboard'
  return '/student/dashboard'
}

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <PageLoader />
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to={getHomeRoute(user)} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={getHomeRoute(user)} />} />

        <Route
          path="/student"
          element={user && user.role === 'student' ? <StudentLayout /> : <Navigate to={getHomeRoute(user)} />}
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="upload-documents" element={<UploadDocuments />} />
          <Route path="my-documents" element={<MyDocuments />} />
          <Route path="profile" element={<Profile />} />
          
        </Route>

        <Route
          path="/admin"
          element={user && user.role === 'admin' ? <AdminLayout /> : <Navigate to={getHomeRoute(user)} />}
        >
          <Route path="dashboard" element={<AdminDashboard />} />
           <Route path="pending" element={<PendingVerifications />} />
           <Route path="documents" element={<AllDocuments />} />
           <Route path="students" element={<Students />} />
           <Route path="reports" element={<Reports />} />
        </Route>

        <Route path="*" element={<Navigate to={getHomeRoute(user)} />} />
      </Routes>
    </Suspense>
  )
}

export default App