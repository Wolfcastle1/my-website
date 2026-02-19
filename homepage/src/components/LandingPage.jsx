import './LandingPage.css'

const emojis = ['🏀', '🏈', '💻', '👾', '🎮', '⌨️', '🖥️', '📱']

function LandingPage() {
  return (
    <main className="landing-page">
      <div className="emoji-container">
        {emojis.map((emoji, index) => (
          <span
            key={index}
            className="floating-emoji"
            style={{
              '--delay': `${index * 0.5}s`,
              '--x-offset': `${(index % 3 - 1) * 100}px`,
              '--duration': `${3 + (index % 3)}s`,
              left: `${10 + (index * 11)}%`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>
      <h1 className="hello-world">Hello World!</h1>
      <p className="subtitle">Welcome to your new React app</p>
    </main>
  )
}

export default LandingPage
