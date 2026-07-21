import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider} from '@tanstack/react-query'
import './index.css'
import Login from './Login.jsx'
import SignUp from './SignUp.jsx'
import GoogleSignUp from './GoogleSignUp.jsx'
import Home from './Home.jsx'
import Stats from './Stats.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import AuthProvider from './components/AuthProvider.jsx'
import NotAvailable from './NotAvailable.jsx'
import Journal from './Journal.jsx'
import EntryProvider from './components/EntryProvider.jsx'
import { useAuth } from './components/AuthProvider.jsx'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { GoogleOAuthProvider } from '@react-oauth/google'

import axios from 'axios';
import GoogleAuthProvider from './components/GoogleAuthProvider.jsx'
import GooglePrivateRoute from './components/GooglePrivateRoute.jsx'
import ForgotPassword from './ForgotPassword.jsx'

axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;
const queryClient = new QueryClient({
  defaultOptions:{
    queries:{
      refetchOnWindowFocus: false
    }
  }
});

function DefaultRedirect() {
  const { user } = useAuth();

  return <Navigate to={user ? "/home" : "/login"} replace />;
}
const googleClient = import.meta.env.VITE_GOOGLE_CLIENT_ID

createRoot(document.getElementById('root')).render(
  <>
    <GoogleOAuthProvider clientId={googleClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword/>} />
              <Route path="/signup/google" element = {
                <GoogleAuthProvider>
                  <GooglePrivateRoute>
                    <GoogleSignUp></GoogleSignUp>
                  </GooglePrivateRoute>
                </GoogleAuthProvider>
              } />
              <Route
                element={
                  <EntryProvider>
                    <Outlet/>
                  </EntryProvider>
                }
              >

                <Route path="/home" element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>}/>
                <Route path="/journal" element={
                  <PrivateRoute>
                    <Journal/>
                  </PrivateRoute >} />
                <Route path="/stats" element={
                  <PrivateRoute>
                    <Stats/>
                  </PrivateRoute>} />

              </Route>
              <Route path="/habits" element={<NotAvailable/>} />
              <Route path="/slambook" element={<NotAvailable/>} />

              
              <Route path="*" element={<DefaultRedirect />} />
            </Routes>
          </Router>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </GoogleOAuthProvider>
    
    
    <Toaster />
  </>
  
)
