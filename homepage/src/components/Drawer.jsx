import { Link } from 'react-router-dom'
import './Drawer.css'

function Drawer({ isOpen, onClose }) {
  return (
    <>
      <div
        className={`drawer-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <nav className={`drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>Menu</h2>
          <button className="close-button" onClick={onClose} aria-label="Close menu">
            ✕
          </button>
        </div>
        <ul className="drawer-menu">
          <li><Link to="/" onClick={onClose}>Home</Link></li>
          <li><Link to="/links" onClick={onClose}>My Links</Link></li>
        </ul>
      </nav>
    </>
  )
}

export default Drawer
