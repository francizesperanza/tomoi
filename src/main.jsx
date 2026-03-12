import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import './index.css'
import Login from './Login.jsx'
import SignUp from './SignUp.jsx'

createRoot(document.getElementById('root')).render(
  <>
    <Router>
      <Routes>
        <Route path="*" element={<Navigate replace to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
    <Toaster />
  </>
  
)
