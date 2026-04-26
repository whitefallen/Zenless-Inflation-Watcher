import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { VfAnalytics } from './vf-analytics'

describe('VfAnalytics', () => {
  it('renders empty state when no Void Front data is provided', () => {
    render(<VfAnalytics data={[]} />)
    expect(
      screen.getByText(/No Void Front data available yet\./i)
    ).toBeInTheDocument()
  })
})
