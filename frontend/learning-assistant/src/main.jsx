import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { Toaster } from "react-hot-toast"
import './index.css'
import { AuthProvider } from './context/Authcontext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3000}}/>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);