import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ElementUsageTrend } from './element-usage-trend'

describe('ElementUsageTrend', () => {
  it('renders empty state with no data', () => {
    render(<ElementUsageTrend data={[]} />)
    expect(screen.getByText(/No element usage data available/i)).toBeInTheDocument()
  })

  it('renders a hint when only one season is provided (chart needs ≥2 points)', () => {
    render(
      <ElementUsageTrend data={[{ label: 'Jan', ts: 1, counts: { 200: 3 } }]} />
    )
    expect(screen.getByText(/At least two seasons/i)).toBeInTheDocument()
  })

  it('renders chart heading when data is provided', () => {
    render(
      <ElementUsageTrend
        data={[
          { label: 'Jan', ts: 1, counts: { 200: 3, 201: 2 } },
          { label: 'Feb', ts: 2, counts: { 200: 1, 202: 4 } },
        ]}
      />
    )
    expect(screen.getByText(/Element usage over time/i)).toBeInTheDocument()
  })
})
