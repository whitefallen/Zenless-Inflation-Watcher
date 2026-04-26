import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { RecordsPanel } from './records-panel'

describe('RecordsPanel', () => {
  it('renders nothing when records array is empty', () => {
    const { container } = render(<RecordsPanel title="Personal Bests" records={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders each record label and value', () => {
    render(
      <RecordsPanel
        title="Personal Bests"
        records={[
          { label: 'Top Score', value: '12,345', sublabel: 'Mar 26' },
          { label: 'Best Rank', value: 'top 0.05%' },
        ]}
      />
    )
    expect(screen.getByText('Personal Bests')).toBeInTheDocument()
    expect(screen.getByText('Top Score')).toBeInTheDocument()
    expect(screen.getByText('12,345')).toBeInTheDocument()
    expect(screen.getByText('Mar 26')).toBeInTheDocument()
    expect(screen.getByText('Best Rank')).toBeInTheDocument()
    expect(screen.getByText('top 0.05%')).toBeInTheDocument()
  })
})
