import { useState, useEffect, useRef } from 'react'
import './AboutPage.css'

const ITEMS = [
  {
    year: 'October 2026',
    title: 'Running in the Chicago Marathon',
    preview: 'Raising money for team World Vision.',
    emoji: '🎽',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
  {
    year: '2025',
    title: 'Adopted Remi',
    preview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.',
    emoji: '🐱',
    body: 'Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident deserunt mollit anim id est laborum sed perspiciatis.',
  },
  {
    year: '2023',
    title: 'Adopted Moose',
    preview: 'Literally Garfield.',
    emoji: '🐱',
    body: 'Incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris. Nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident deserunt mollit anim id est laborum perspiciatis.',
  },
  {
    year: '2021',
    title: 'Big Boy Job',
    preview: 'Experience taught way more than school ever did.',
    emoji: '💼',
    body: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est qui dolorem ipsum quia dolor sit amet consectetur adipisci velit sed quia non numquam eius modi tempora incidunt.',
  },
  {
    year: '2017-2021',
    title: 'Northern Illinois University',
    preview: 'State School... Close to Home... Good Value... Go Huskies!',
    emoji: '📓',
    body: 'Ut labore et dolore magnam aliquam quaerat voluptatem ut enim ad minima veniam quis nostrum exercitationem ullam corporis suscipit laboriosam. Nisi ut aliquid ex ea commodi consequatur quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur vel illum qui dolorem eum fugiat.',
  },
  {
    year: '1999-2017',
    title: 'Born and Raised in Chicago Suburbs',
    preview: 'Sports, Videogames, Movies, School, Friends, Family, etc.',
    emoji: '🪁',
    body: 'o inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ',
  },
]

function AboutPage() {
  const [expandedIdx, setExpandedIdx] = useState(null)
  const expanded = expandedIdx !== null ? ITEMS[expandedIdx] : null
  const containerRef = useRef(null)
  const rowRefs = useRef([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const update = () => {
      const containerRect = container.getBoundingClientRect()
      const centerY = containerRect.top + containerRect.height / 2

      rowRefs.current.forEach(row => {
        if (!row) return
        const rowRect = row.getBoundingClientRect()
        const rowCenterY = rowRect.top + rowRect.height / 2
        const distance = Math.abs(rowCenterY - centerY)
        const maxDistance = containerRect.height * 0.55
        const t = Math.min(distance / maxDistance, 1)
        const eased = t * t
        const scale = 1 - eased * 0.42
        const opacity = 1 - eased * 0.6
        row.style.transform = `scale(${scale})`
        row.style.opacity = opacity
      })
    }

    update()
    container.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      container.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <main className={`about-page${expanded ? ' about-page--locked' : ''}`}>
      <div
        className={`timeline-scroll${expanded ? ' timeline-scroll--locked' : ''}`}
        ref={containerRef}
      >
<div className="timeline">
        {[...ITEMS].reverse().map((item, i) => {
          const originalIdx = ITEMS.length - 1 - i
          const side = i % 2 === 0 ? 'left' : 'right'
          return (
            <div
              key={i}
              className="tl-row"
              ref={el => { rowRefs.current[i] = el }}
            >
              <div className="tl-slot">
                {side === 'left' && (
                  <button className="tl-card" onClick={() => setExpandedIdx(originalIdx)}>
                    <div className="tl-card-img-wrap">
                      <span className="tl-emoji">{item.emoji}</span>
                    </div>
                    <div className="tl-card-body">
                      <span className="tl-year">{item.year}</span>
                      <h3 className="tl-title">{item.title}</h3>
                      <p className="tl-preview">{item.preview}</p>
                    </div>
                  </button>
                )}
              </div>

              <div className="tl-center">
                <div className="tl-dot" />
              </div>

              <div className="tl-slot">
                {side === 'right' && (
                  <button className="tl-card" onClick={() => setExpandedIdx(originalIdx)}>
                    <div className="tl-card-img-wrap">
                      <span className="tl-emoji">{item.emoji}</span>
                    </div>
                    <div className="tl-card-body">
                      <span className="tl-year">{item.year}</span>
                      <h3 className="tl-title">{item.title}</h3>
                      <p className="tl-preview">{item.preview}</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      </div>

      {expanded && (
        <div className="tl-overlay" onClick={() => setExpandedIdx(null)}>
          <div className="tl-expanded" onClick={e => e.stopPropagation()}>
            <button className="tl-close" onClick={() => setExpandedIdx(null)}>✕</button>
            <div className="tl-expanded-img-wrap">
              <span className="tl-emoji tl-emoji--large">{expanded.emoji}</span>
            </div>
            <div className="tl-expanded-body">
              <span className="tl-year">{expanded.year}</span>
              <h2 className="tl-expanded-title">{expanded.title}</h2>
              <p className="tl-expanded-text">{expanded.body}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default AboutPage
