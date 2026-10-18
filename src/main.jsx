
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App'
import AppErrorBoundary from './components/AppErrorBoundary'
import ToastProvider from './components/ToastProvider'

import './styles/design-system.css'
import './styles/shell.css'
import './styles/navigation.css'
import './styles/components.css'
import './styles/loading.css'
import './styles/home.css'
import './styles/results.css'
import './styles/details.css'
import './styles/information.css'
import './styles/secondary-pages.css'
import './styles/command-palette.css'
import './styles/toast.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error(
    'Root element with id "root" was not found.',
  )
}

createRoot(rootElement).render(
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <AppErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AppErrorBoundary>
  </BrowserRouter>,
)
