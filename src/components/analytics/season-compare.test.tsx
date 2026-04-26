import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SeasonCompare } from './season-compare'

describe('SeasonCompare', () => {
  it('shows hint when fewer than 2 seasons are provided', () => {
    render(<SeasonCompare seasons={[{ id: 'a', label: 'Jan', ts: 1 }]} getMetrics={() => []} />)
    expect(screen.getByText(/Need at least two seasons/i)).toBeInTheDocument()
  })

  it('renders metrics grid with delta when seasons have values', () => {
    render(
      <SeasonCompare
        seasons={[
          { id: 'a', label: 'Jan', ts: 1 },
          { id: 'b', label: 'Feb', ts: 2 },
        ]}
        getMetrics={id => [
          { label: 'Score', value: id === 'a' ? 100 : 200 },
        ]}
      />
    )
    expect(screen.getByText('Side-by-side delta')).toBeInTheDocument()
    expect(screen.getByText('Score')).toBeInTheDocument()
  })
})
