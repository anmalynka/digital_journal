import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { JournalProvider } from './context/JournalContext'
import { router } from './router'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <JournalProvider>
      <RouterProvider router={router} />
    </JournalProvider>
  </React.StrictMode>,
)
