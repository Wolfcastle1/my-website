import { useState } from 'react'
import './AboutPage.css'

const TABS = ['Personal', 'Athletic', 'Professional']
const TRANSITION_MS = 1000

const contexts = {
  Personal: {
    bio: 'Outside of work and sport I enjoy exploring new technologies, gaming, and spending time outdoors. I value creativity, curiosity, and finding the balance between ambition and rest.',
    skillsTitle: 'Interests',
    skills: ['Gaming', 'Hiking', 'Photography', 'Cooking', 'Music', 'Reading', 'Travel', 'Open Source'],
    timelineTitle: 'Highlights',
    timeline: [
      {
        period: '2023',
        title: 'Personal Project',
        organisation: 'Side Project',
        description: 'Built and shipped a personal project you are proud of.',
      },
      {
        period: '2021',
        title: 'Milestone',
        organisation: 'Personal',
        description: 'A meaningful personal milestone or life event.',
      },
      {
        period: '2018',
        title: 'Another Highlight',
        organisation: 'Personal',
        description: 'Another meaningful personal achievement or experience.',
      },
    ],
  },

  Athletic: {
    bio: 'Sport has always been a big part of my life. Competing has taught me discipline, resilience, and the value of pushing through when things get hard — lessons I carry into everything I do.',
    skillsTitle: 'Sports & Activities',
    skills: ['Basketball', 'Football', 'Running', 'Strength Training', 'Swimming', 'Cycling'],
    timelineTitle: 'Athletic Career',
    timeline: [
      {
        period: '2022 – Present',
        title: 'Your Sport',
        organisation: 'Your Team / Club',
        description: 'Describe your current athletic involvement and any achievements.',
      },
      {
        period: '2018 – 2022',
        title: 'Your Sport',
        organisation: 'Previous Team / Club',
        description: 'Describe a previous athletic chapter and what you accomplished.',
      },
      {
        period: '2014 – 2018',
        title: 'Your Sport',
        organisation: 'School / Academy',
        description: 'Early competitive experience and formative athletic years.',
      },
    ],
  },

  Professional: {
    bio: 'A software developer who enjoys building full-stack web applications. I work across the whole stack — crafting clean UIs in React, writing efficient Go backends, and designing PostgreSQL schemas that scale.',
    skillsTitle: 'Technical Skills',
    skills: ['JavaScript', 'React', 'Go', 'PostgreSQL', 'HTML / CSS', 'Node.js', 'Git', 'REST APIs'],
    timelineTitle: 'Experience & Education',
    timeline: [
      {
        period: '2024 – Present',
        title: 'Software Engineer',
        organisation: 'Your Company',
        description: 'Brief description of your role and what you work on day-to-day.',
      },
      {
        period: '2022 – 2024',
        title: 'Junior Developer',
        organisation: 'Previous Company',
        description: 'Brief description of your responsibilities and projects here.',
      },
      {
        period: '2018 – 2022',
        title: 'BSc Computer Science',
        organisation: 'Your University',
        description: 'Graduated with a focus on software engineering and distributed systems.',
      },
    ],
  },
}

function ContentPanel({ ctx, fontClass, panelClass }) {
  return (
    <div className={`about-content ${fontClass} ${panelClass}`}>

      <section className="about-hero">
        <div className="profile-photo-wrapper">
          <div className="profile-initials">YN</div>
          <img
            src="/profile.jpg"
            alt="Profile"
            className="profile-photo"
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
        </div>
        <div className="about-intro">
          <h1 className="about-name">Your Name</h1>
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
