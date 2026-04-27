import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { AgentFilterBar } from './agent-filter-bar'
import type { AgentEntry } from './types'

const meta = {
  title: 'Analytics/AgentFilterBar',
  component: AgentFilterBar,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof AgentFilterBar>

export default meta
type Story = StoryObj<typeof meta>

const sampleAgents: AgentEntry[] = Array.from({ length: 18 }, (_, i) => ({
  id: 1100 + i,
  iconUrl: '',
  seasonCount: 18 - i,
}))

function StatefulBar({ accent = '#00d4ff', initialSelected = [] as number[] }) {
  const [selected, setSelected] = useState<number[]>(initialSelected)
  return (
    <AgentFilterBar agents={sampleAgents} selected={selected} onChange={setSelected} accent={accent} />
  )
}

export const Default: Story = { render: () => <StatefulBar /> }

export const WithSelection: Story = {
  render: () => <StatefulBar initialSelected={[1100, 1102]} />,
}

export const Empty: Story = {
  args: { agents: [], selected: [], onChange: () => {} },
}
