import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SeasonCompare } from './season-compare'

const meta = {
  title: 'Analytics/SeasonCompare',
  component: SeasonCompare,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof SeasonCompare>

export default meta
type Story = StoryObj<typeof meta>

const seasons = [
  { id: 's1', label: 'Mar 26', ts: 3 },
  { id: 's2', label: 'Apr 26', ts: 4 },
  { id: 's3', label: 'May 26', ts: 5 },
]

const metricsBySeason: Record<
  string,
  { label: string; value: number; unit?: string; lowerIsBetter?: boolean; display?: string }[]
> = {
  s1: [
    { label: 'Total Score', value: 9100 },
    { label: 'Score %', value: 78.5, unit: '%' },
    { label: 'Stars', value: 7 },
    { label: 'Rank %', value: 12.5, display: 'top 12.5%', lowerIsBetter: true, unit: '%' },
  ],
  s2: [
    { label: 'Total Score', value: 9620 },
    { label: 'Score %', value: 82.4, unit: '%' },
    { label: 'Stars', value: 8 },
    { label: 'Rank %', value: 8.1, display: 'top 8.1%', lowerIsBetter: true, unit: '%' },
  ],
  s3: [
    { label: 'Total Score', value: 10100 },
    { label: 'Score %', value: 86.0, unit: '%' },
    { label: 'Stars', value: 9 },
    { label: 'Rank %', value: 4.6, display: 'top 4.6%', lowerIsBetter: true, unit: '%' },
  ],
}

export const Default: Story = {
  args: {
    accent: '#f5c842',
    seasons,
    getMetrics: id => metricsBySeason[id] ?? [],
  },
}

export const TooFewSeasons: Story = {
  args: { seasons: [seasons[0]], getMetrics: () => [] },
}
