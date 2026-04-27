import { describe, expect, it } from 'vitest'
import { buildTrendQuips, buildWatcherVerdict } from './analytics-quips'

describe('analytics quips', () => {
  it('roasts a clear decline', () => {
    const quips = buildTrendQuips([
      {
        name: 'Deadly Assault',
        color: '#ff3d2e',
        points: [
          { ts: 1, label: 'A', scorePct: 90 },
          { ts: 2, label: 'B', scorePct: 82 },
          { ts: 3, label: 'C', scorePct: 74 },
        ],
      },
    ])

    expect(quips).toHaveLength(1)
    expect(quips[0].severity).toBe('roast')
    expect(quips[0].sentence).toMatch(/DA|dropped|down|slid/i)
  })

  it('praises a clear climb and creates an overall verdict', () => {
    const quips = buildTrendQuips([
      {
        name: 'Void Front',
        color: '#2be0ff',
        points: [
          { ts: 1, label: 'A', scorePct: 60 },
          { ts: 2, label: 'B', scorePct: 70 },
          { ts: 3, label: 'C', scorePct: 82 },
        ],
      },
    ])

    expect(quips[0].severity).toBe('praise')
    expect(buildWatcherVerdict(quips)).toMatch(/Overall pressure is up/i)
  })
})
