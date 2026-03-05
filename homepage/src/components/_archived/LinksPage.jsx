import './LinksPage.css'

const LINKS = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    description: 'Connect with me professionally',
    url: 'https://www.linkedin.com/in/samuel-thomas-464076163/',
    icon: '💼',
  },
  {
    id: 'github',
    label: 'GitHub',
    description: 'Check out my projects and code',
    url: 'https://github.com/Wolfcastle1',
    icon: '🐙',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    description: 'Follow me on Instagram',
    url: 'https://www.instagram.com/dummy_thicc_cavz',
    icon: '📸',
  },
]

function LinksPage() {
  return (
    <div className="links-page">
      <h1 className="links-title">My Links</h1>
      <div className="links-grid">
        {LINKS.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-card"
          >
            <span className="link-card-icon">{link.icon}</span>
            <div className="link-card-text">
              <span className="link-card-label">{link.label}</span>
              <span className="link-card-description">{link.description}</span>
            </div>
            <span className="link-card-arrow">→</span>
          </a>
        ))}
      </div>
    </div>
  )
}

export default LinksPage
