import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AgentFilterBar } from './agent-filter-bar'

describe('AgentFilterBar', () => {
  it('renders nothing when there are no agents', () => {
    const { container } = render(
      <AgentFilterBar agents={[]} selected={[]} onChange={() => {}} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('toggles an agent when clicked', () => {
    const onChange = vi.fn()
    render(
      <AgentFilterBar
        agents={[{ id: 1234, iconUrl: '', seasonCount: 3 }]}
        selected={[]}
        onChange={onChange}
      />
    )
    fireEvent.click(screen.getByTitle(/Agent 1234/i))
    expect(onChange).toHaveBeenCalledWith([1234])
  })
})
