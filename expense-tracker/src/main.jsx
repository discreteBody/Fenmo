import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster
      position="top-right"
      theme="dark"
      richColors
      closeButton
      visibleToasts={3}
      duration={4000}
    />
    <App />
  </StrictMode>,
)
