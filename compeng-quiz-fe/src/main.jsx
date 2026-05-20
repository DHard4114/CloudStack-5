import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ============================================================
// ENTRY POINT — QuizLive CompEng Frontend
// ------------------------------------------------------------
// React 18 concurrent root, dibungkus StrictMode untuk
// mendeteksi efek samping ganda di development.
// ============================================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
