import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { RecordsPanel } from './records-panel'

const meta = {
  title: 'Analytics/RecordsPanel',
  component: RecordsPanel,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof RecordsPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Personal Bests',
    accent: '#f5c842',
    records: [
      { label: 'Best Score%', value: '92.4%', sublabel: 'Mar 26' },
      { label: 'Top Single Run', value: '12,345', sublabel: 'Hekate' },
      { label: 'Most Stars', value: 9, sublabel: 'Apr 26' },
      { label: 'Best Rank', value: 'top 0.05%', sublabel: 'Feb 26' },
      { label: 'Seasons Tracked', value: 12 },
    ],
  },
}

export const Empty: Story = {
  args: { title: 'Personal Bests', records: [] },
}

export const HadalAccent: Story = {
  args: {
    title: 'Personal Bests',
    accent: '#00d4ff',
    records: [
      { label: 'Best Score%', value: '88.2%', sublabel: 'Apr 26' },
      { label: 'Top Score', value: '38,420', sublabel: 'Mar 26' },
      { label: 'S+ / S Seasons', value: 7 },
      { label: 'Seasons Tracked', value: 9 },
    ],
  },
}
