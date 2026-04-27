import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ShareCard } from './share-card'

const meta = {
  title: 'Analytics/ShareCard',
  component: ShareCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof ShareCard>

export default meta
type Story = StoryObj<typeof meta>

export const DeadlyAssault: Story = {
  args: {
    accent: '#f5c842',
    mode: 'Deadly Assault',
    title: 'Season 2026-3',
    stats: [
      { label: 'Score', value: '12,345' },
      { label: 'Stars', value: 9 },
      { label: 'Rank', value: 'top 0.05%' },
      { label: 'Runs', value: 3 },
    ],
  },
}

export const Hadal: Story = {
  args: {
    accent: '#00d4ff',
    mode: 'Hadal Blacksite',
    title: 'Season 2026-2',
    stats: [
      { label: 'Score', value: '38,420' },
      { label: 'Rating', value: 'S+' },
      { label: 'Rank', value: 'top 0.12%' },
      { label: 'Floors', value: 5 },
    ],
  },
}

export const VoidFront: Story = {
  args: {
    accent: '#a855f7',
    mode: 'Void Front',
    title: 'Echoes of Eternity',
    stats: [
      { label: 'Score', value: '6,789' },
      { label: 'Rank', value: 'top 1.20%' },
      { label: 'Challenges', value: 7 },
    ],
  },
}
