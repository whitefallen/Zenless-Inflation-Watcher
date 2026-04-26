import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DaAnalytics } from './da-analytics'

describe('DaAnalytics', () => {
  it('renders without crashing when no data is provided', () => {
    const { container } = render(<DaAnalytics data={[]} />)
    expect(container).toBeTruthy()
  })
})
