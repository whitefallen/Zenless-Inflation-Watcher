import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { InflationTracker } from './inflation-tracker'

const meta = {
  title: 'Analytics/InflationTracker',
  component: InflationTracker,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof InflationTracker>

export default meta
type Story = StoryObj<typeof meta>

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']

const series = (name: string, color: string, pcts: number[]) => ({
  name,
  color,
  points: pcts.map((scorePct, i) => ({ ts: i, label: months[i] ?? `M${i}`, scorePct })),
})

export const ThreeModes: Story = {
  args: {
    series: [
      series('Deadly Assault', '#f5c842', [88, 86, 85, 80, 78, 76, 74, 72]),
      series('Hadal Blacksite', '#00d4ff', [82, 84, 80, 81, 79, 78, 75, 73]),
      series('Void Front', '#a855f7', [90, 92, 91, 88, 87, 86, 84, 82]),
    ],
  },
}

export const FlatTrend: Story = {
  args: {
    series: [series('Hadal Blacksite', '#00d4ff', [82, 81, 83, 82, 81, 82, 80, 81])],
  },
}

export const Empty: Story = {
  args: { series: [] },
}
