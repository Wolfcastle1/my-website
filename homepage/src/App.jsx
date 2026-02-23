import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import { Routes, Route } from 'react-router-dom'
import TopBar from './components/TopBar'
import Drawer from './components/Drawer'
import LandingPage from './components/LandingPage'
import LinksPage from './components/LinksPage'
import AboutPage from './components/AboutPage'
import './App.css'

const API_BASE = 'http://localhost:8080'

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [coins, setCoins] = useState(0)
  const { user, isSignedIn } = useUser()
  const { getToken } = useAuth()

  useEffect(() => {
    if (!isSignedIn || !user) return

    const fetchCoins = async () => {
      const token = await getToken()
      const email = user.primaryEmailAddress.emailAddress
      const res = await fetch(`${API_BASE}/${email}`, {
        method: 'GET', 
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setCoins(data.Tokens)
    }

    fetchCoins()
  }, [isSignedIn, user])

  const handleMenuClick = () => {
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
  }

  const handleAddCoin = async () => {
    const token = await getToken()
    const email = user.primaryEmailAddress.emailAddress
    const res = await fetch(`${API_BASE}/${email}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setCoins(data.newTotal)
  }

  return (
    <>
      <TopBar onMenuClick={handleMenuClick} coins={coins} onAddCoin={handleAddCoin} />
      <Drawer isOpen={isDrawerOpen} onClose={handleDrawerClose} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/links" element={<LinksPage />} />
      </Routes>
    </>
  )
}

export default App
