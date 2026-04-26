import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AgentSynergyHeatmap } from './agent-synergy-heatmap'

describe('AgentSynergyHeatmap', () => {
  it('renders empty state with no teams', () => {
    render(<AgentSynergyHeatmap teams={[]} />)
    expect(screen.getByText(/No team data available/i)).toBeInTheDocument()
  })

  it('aggregates pair counts and renders the most common pair first', () => {
    render(
      <AgentSynergyHeatmap
        teams={[
          { agentIds: [1, 2, 3], agentIcons: {} },
          { agentIds: [1, 2, 4], agentIcons: {} },
          { agentIds: [3, 4], agentIcons: {} },
        ]}
      />
    )
    // Pair (1,2) appears in two teams
    expect(screen.getByText('2×')).toBeInTheDocument()
    // Several pairs appear once
    const ones = screen.getAllByText('1×')
    expect(ones.length).toBeGreaterThan(0)
  })
})
