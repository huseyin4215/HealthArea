import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { UserProgressProvider } from './context/UserProgressContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import PrivateRoute from './components/auth/PrivateRoute'
import LoadingSpinner from './components/common/LoadingSpinner'
import UserList from './components/UserList'

// Import newly created components
import UserProfile from './components/profile/UserProfile'
import HealthDataList from './components/health/HealthDataList'
import HealthDataForm from './components/health/HealthDataForm'
import ExerciseList from './components/exercise/ExerciseList'

// Lazy loaded components
const Dashboard = lazy(() => import('./components/Dashboard'))
const Login = lazy(() => import('./components/auth/Login'))
const Register = lazy(() => import('./components/auth/Register'))
const Profile = lazy(() => import('./components/profile/Profile'))
const Avatar = lazy(() => import('./components/profile/Avatar'))
const ExerciseRecommendations = lazy(() => import('./components/exercise/ExerciseRecommendations'))
const ExerciseDetailPage = lazy(() => import('./components/exercise/ExerciseDetailPage'))
const HealthLog = lazy(() => import('./components/health/HealthLog'))
const HealthCalculator = lazy(() => import('./components/health/HealthCalculator'))
const Friends = lazy(() => import('./components/friends/Friends'))
const Medications = lazy(() => import('./components/medications/Medications'))
const CompleteProfileForm = lazy(() => import('./components/profile/CompleteProfileForm'))

function App() {
  // Create router with future flags enabled
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/complete-profile" element={<CompleteProfileForm />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="avatar" element={<PrivateRoute><Avatar /></PrivateRoute>} />
          <Route path="exercise-recommendations" element={<PrivateRoute><ExerciseRecommendations /></PrivateRoute>} />
          <Route path="exercise-recommendations/:id" element={<PrivateRoute><ExerciseDetailPage /></PrivateRoute>} />
          <Route path="exercises" element={<PrivateRoute><ExerciseList /></PrivateRoute>} />
          <Route path="exercises/:id" element={<PrivateRoute><ExerciseDetailPage /></PrivateRoute>} />
          <Route path="health-log" element={<PrivateRoute><HealthLog /></PrivateRoute>} />
          <Route path="health-calculator" element={<PrivateRoute><HealthCalculator /></PrivateRoute>} />
          <Route path="friends" element={<PrivateRoute><Friends /></PrivateRoute>} />
          <Route path="medications" element={<PrivateRoute><Medications /></PrivateRoute>} />
          <Route path="users" element={<PrivateRoute><UserList /></PrivateRoute>} />
          <Route path="user-profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
          <Route path="health-data" element={<PrivateRoute><HealthDataList /></PrivateRoute>} />
          <Route path="add-health-data" element={<PrivateRoute><HealthDataForm /></PrivateRoute>} />
          <Route path="exercises" element={<PrivateRoute><ExerciseList /></PrivateRoute>} />
        </Route>
      </>
    ),
    {
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }
    }
  );

  return (
    <AuthProvider>
      <UserProgressProvider>
        <ThemeProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <RouterProvider router={router} />
          </Suspense>
        </ThemeProvider>
      </UserProgressProvider>
    </AuthProvider>
  )
}

export default App