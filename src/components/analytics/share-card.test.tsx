import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ShareCard } from './share-card'

describe('ShareCard', () => {
  it('renders the title, mode label, and stats', () => {
    render(
      <ShareCard
        mode="Deadly Assault"
        title="Season 2026-3"
        stats={[
          { label: 'Score', value: '12,345' },
          { label: 'Stars', value: 9 },
        ]}
      />
    )
    expect(screen.getByText(/ZZZ · Deadly Assault/i)).toBeInTheDocument()
    expect(screen.getByText('Season 2026-3')).toBeInTheDocument()
    expect(screen.getByText('Score')).toBeInTheDocument()
    expect(screen.getByText('12,345')).toBeInTheDocument()
    expect(screen.getByText('Stars')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Download PNG/i })).toBeInTheDocument()
  })
})
