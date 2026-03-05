import { useLocation } from 'react-router-dom'
import LandingPage from './components/LandingPage'

function App() {
  const { pathname } = useLocation()
  const initialWindow = pathname === '/about' ? 'about'
                      : pathname === '/links'  ? 'links'
                      : 'terminal'
  return <LandingPage initialWindow={initialWindow} />
}

export default App
