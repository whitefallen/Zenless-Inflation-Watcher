import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HadalAnalytics } from './hadal-analytics'

describe('HadalAnalytics', () => {
  it('renders empty state when no v2 data is provided', () => {
    render(<HadalAnalytics data={[]} />)
    expect(
      screen.getByText(/No Hadal Blacksite \(v2\) data available\./i)
    ).toBeInTheDocument()
  })
})
