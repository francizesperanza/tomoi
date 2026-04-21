import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom'
import './index.css'
import Login from './Login.jsx'
import SignUp from './SignUp.jsx'
import Home from './Home.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import AuthProvider from './components/AuthProvider.jsx'
import NotAvailable from './NotAvailable.jsx'
import Journal from './Journal.jsx'
import EntryProvider from './components/EntryProvider.jsx'

createRoot(document.getElementById('root')).render(
  <>
    <AuthProvider>
        <Router>
          <Routes>
            <Route path="*" element={<Navigate replace to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
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

            </Route>
            <Route path="/habits" element={<NotAvailable/>} />
            <Route path="/slambook" element={<NotAvailable/>} />
            <Route path="/stats" element={<NotAvailable/>} />
          </Routes>
        </Router>
    </AuthProvider>
    <Toaster />
  </>
  
)
