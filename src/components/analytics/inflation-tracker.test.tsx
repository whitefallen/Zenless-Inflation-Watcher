import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { InflationTracker } from './inflation-tracker'

describe('InflationTracker', () => {
  it('renders empty state when no series have points', () => {
    render(<InflationTracker series={[]} />)
    expect(screen.getByText(/Not enough data/i)).toBeInTheDocument()
  })

  it('renders the chart heading when at least one series has data', () => {
    render(
      <InflationTracker
        series={[
          {
            name: 'Deadly Assault',
            color: '#ffd400',
            points: [
              { ts: 1, label: 'Jan', scorePct: 80 },
              { ts: 2, label: 'Feb', scorePct: 75 },
            ],
          },
        ]}
      />
    )
    expect(screen.getByText(/Score pressure across seasons/i)).toBeInTheDocument()
  })
})
