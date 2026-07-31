import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import './styles/span.css'
import { getDb } from './db/db'
import { appendEvent, exportEvents } from './db/events'

// Debug/backup hook: the event log is the backup format, and scripted
// checks seed history through the same append path the app uses.
;(window as unknown as Record<string, unknown>).__span = { getDb, appendEvent, exportEvents }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
