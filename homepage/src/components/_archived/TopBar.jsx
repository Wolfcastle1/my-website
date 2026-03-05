import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/clerk-react'
import './TopBar.css'

function TopBar({ onMenuClick, coins, onAddCoin }) {
  return (
    <header className="top-bar">
      <button className="menu-button" onClick={onMenuClick} aria-label="Open menu">
        <span className="menu-icon">☰</span>
      </button>

      <div className="top-bar-right">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="login-button">Log In</button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div className="coin-area">
            <button className="coin-add-button" onClick={onAddCoin} aria-label="Add coin">+</button>
            <div className="coin-display">
              <span>🚀</span>
              <span className="coin-count">{coins}</span>
            </div>
          </div>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'user-avatar-clerk'
              }
            }}
          />
        </SignedIn>
      </div>
    </header>
  )
}

export default TopBar
