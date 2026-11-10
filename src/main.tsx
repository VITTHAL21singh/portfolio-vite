import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')

if (!rootElement) {
  document.body.innerHTML = '<main style="padding:2rem;font:16px system-ui;color:#f2f0e9;background:#10110f;min-height:100vh"><h1>Portfolio could not start</h1><p>The page root element is missing. Please check index.html.</p></main>'
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
