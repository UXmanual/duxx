import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

/* 
  명시적인 스타일 로딩 순서 강제:
  1. Base Global Styles
  2. Theme Overrides (Light/Dark)
*/
import './styles/global.css'
import './styles/themes/light.css'
import './styles/themes/dark.css'

import { ThemeProvider } from './context/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
