import { useState } from 'react'
import './AboutPage.css'

const TABS = ['Personal', 'Athletic', 'Professional']
const TRANSITION_MS = 1000

const contexts = {
  Personal: {
    bio: 'Outside of work and sport I enjoy building things for the web, watching the NBA, and exploring indie games. I find that each of these keeps me curious in different ways — whether it\'s a clever mechanic in a small game or a last-second buzzer beater.',
    skillsTitle: 'Interests',
    skills: ['Independent Web Dev', 'Basketball', 'NBA', 'Indie Games', 'Long Distance Running', 'Swimming'],
    timelineTitle: 'Highlights',
    timeline: [
      {
        period: '2026',
        title: 'Chicago Marathon',
        organisation: 'Bank of America Chicago Marathon',
        description: 'Registered and training for the 2026 Chicago Marathon — 26.2 miles through the city I call home.',
      },
      {
        period: '2025',
        title: 'LIFETIME Chicago Half Marathon',
        organisation: 'LIFETIME',
        description: 'Ran my first official race — the LIFETIME Chicago Half Marathon. A milestone that sparked the push toward the full 26.2.',
      },
      {
        period: '2025',
        title: 'This Website',
        organisation: 'Personal Project',
        description: 'Designed and built a Mac desktop–style portfolio site with a React frontend, Go backend, and Postgres database.',
      },
    ],
  },

  Athletic: {
    bio: 'Sport has always been a core part of who I am. I competed in swimming and water polo through high school, and now I\'m channeling that competitive drive into long distance running.',
    skillsTitle: 'Sports & Activities',
    skills: ['Long Distance Running', 'Swimming', 'Water Polo', 'Basketball', 'Strength Training'],
    timelineTitle: 'Athletic Timeline',
    timeline: [
      {
        period: '2026',
        title: 'Chicago Marathon',
        organisation: 'Bank of America Chicago Marathon',
        description: 'Training for the full 26.2 miles. The Bank of America Chicago Marathon is one of the six World Marathon Majors.',
      },
      {
        period: '2025',
        title: 'LIFETIME Chicago Half Marathon',
        organisation: 'LIFETIME',
        description: 'Completed my first half marathon — 13.1 miles through Chicago. First race, not the last.',
      },
      {
        period: '2017 – 2021',
        title: 'Competitive Swimming & Water Polo',
        organisation: 'High School',
        description: 'Competed at the high school level in both swimming and water polo. These sports built the foundation of discipline and team-first mentality I carry today.',
      },
    ],
  },

  Professional: {
    bio: 'Full stack software engineer based in Chicago, Illinois. I build web applications end-to-end and care deeply about clean, maintainable code and good user experiences.',
    skillsTitle: 'Technical Skills',
    skills: ['JavaScript', 'React', 'Go', 'PostgreSQL', 'HTML / CSS', 'Node.js', 'Git', 'REST APIs', 'TypeScript', 'SQL'],
    timelineTitle: 'Experience & Education',
    timeline: [
      {
        period: '2021 – Present',
        title: 'Software Engineer',
        organisation: 'JPMorgan Chase',
        description: 'Full stack developer on JPMorgan Access — a commercial banking platform. Work across the frontend and backend to build and maintain features used by business clients worldwide.',
      },
      {
        period: '2017 – 2021',
        title: 'BS Computer Science, Minor in Mathematics',
        organisation: 'Northern Illinois University',
        description: 'Studied computer science with a mathematics minor. Built a foundation in algorithms, data structures, software engineering, and quantitative reasoning.',
      },
    ],
  },
}

function ContentPanel({ ctx, fontClass, panelClass }) {
  return (
    <div className={`about-content ${fontClass} ${panelClass}`}>

      <section className="about-hero">
        <div className="profile-photo-wrapper">
          <div className="profile-initials">ST</div>
          <img
            src="/profile.jpg"
            alt="Profile"
            className="profile-photo"
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
        </div>
        <div className="about-intro">
          <h1 className="about-name">Samuel Thomas</h1>
          <p className="about-bio">{ctx.bio}</p>
        </div>
      </section>

      <section className="about-section">
        <h2 className="section-title">{ctx.skillsTitle}</h2>
        <div className="skills-grid">
          {ctx.skills.map(skill => (
            <span key={skill} className="skill-badge">{skill}</span>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2 className="section-title">{ctx.timelineTitle}</h2>
        <div className="timeline">
          {ctx.timeline.map((item, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-period">{item.period}</div>
              <div className="timeline-content">
                <h3 className="timeline-title">{item.title}</h3>
                <span className="timeline-org">{item.organisation}</span>
                <p className="timeline-desc">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}

function AboutPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [exitTab, setExitTab]     = useState(null)
  const [direction, setDirection] = useState('right')

  const handleTabChange = (newIndex) => {
    if (newIndex === activeTab || exitTab !== null) return
    setDirection(newIndex > activeTab ? 'right' : 'left')
    setExitTab(activeTab)
    setActiveTab(newIndex)
    setTimeout(() => setExitTab(null), TRANSITION_MS)
  }

  const isTransitioning = exitTab !== null
  const enterClass = isTransitioning
    ? (direction === 'right' ? 'slide-in-from-right' : 'slide-in-from-left')
    : ''
  const exitClass = direction === 'right' ? 'slide-out-to-left' : 'slide-out-to-right'

  return (
    <main className="about-page">

      <div className="context-picker">
        <div className="picker-track" style={{ '--active-index': activeTab }}>
          <div className="picker-thumb" />
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`picker-option${activeTab === i ? ' active' : ''}`}
              onClick={() => handleTabChange(i)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="content-viewport">
        {isTransitioning && (
          <ContentPanel
            ctx={contexts[TABS[exitTab]]}
            fontClass={`font-${TABS[exitTab].toLowerCase()}`}
            panelClass={exitClass}
          />
        )}
        <ContentPanel
          key={activeTab}
          ctx={contexts[TABS[activeTab]]}
          fontClass={`font-${TABS[activeTab].toLowerCase()}`}
          panelClass={enterClass}
        />
      </div>

    </main>
  )
}

export default AboutPage
