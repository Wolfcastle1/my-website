import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import TopBar from './components/TopBar'
import Drawer from './components/Drawer'
import LandingPage from './components/LandingPage'
import LinksPage from './components/LinksPage'
import './App.css'

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [coins, setCoins] = useState(0)

  const handleMenuClick = () => {
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
  }

  return (
    <>
      <TopBar onMenuClick={handleMenuClick} coins={coins} onAddCoin={() => setCoins(c => c + 1)} />
      <Drawer isOpen={isDrawerOpen} onClose={handleDrawerClose} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/links" element={<LinksPage />} />
      </Routes>
    </>
  )
}

export default App
