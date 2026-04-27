import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AgentSynergyHeatmap } from './agent-synergy-heatmap'

const meta = {
  title: 'Analytics/AgentSynergyHeatmap',
  component: AgentSynergyHeatmap,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof AgentSynergyHeatmap>

export default meta
type Story = StoryObj<typeof meta>

const teams = (groups: number[][]) =>
  groups.map(ids => ({ agentIds: ids, agentIcons: {}, score: 1000 + ids[0] }))

export const Default: Story = {
  args: {
    accent: '#00d4ff',
    teams: teams([
      [1011, 1041, 1131],
      [1011, 1041, 1131],
      [1011, 1041, 1141],
      [1131, 1041, 1191],
      [1011, 1141, 1191],
      [1191, 1041, 1011],
    ]),
  },
}

export const NoScores: Story = {
  args: { teams: [{ agentIds: [1, 2, 3], agentIcons: {} }, { agentIds: [1, 2, 4], agentIcons: {} }] },
}

export const Empty: Story = { args: { teams: [] } }
