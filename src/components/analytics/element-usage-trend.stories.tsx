import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ElementUsageTrend } from './element-usage-trend'

const meta = {
  title: 'Analytics/ElementUsageTrend',
  component: ElementUsageTrend,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof ElementUsageTrend>

export default meta
type Story = StoryObj<typeof meta>

export const FullSpread: Story = {
  args: {
    accent: '#00d4ff',
    data: [
      { label: 'Jan', ts: 1, counts: { 200: 4, 201: 2, 202: 1 } },
      { label: 'Feb', ts: 2, counts: { 200: 2, 201: 3, 202: 2, 203: 1 } },
      { label: 'Mar', ts: 3, counts: { 201: 4, 202: 2, 203: 2, 204: 1 } },
      { label: 'Apr', ts: 4, counts: { 201: 3, 202: 3, 203: 2, 204: 2, 205: 1 } },
    ],
  },
}

export const SingleSeason: Story = {
  args: { data: [{ label: 'Apr 26', ts: 1, counts: { 200: 3, 201: 2 } }] },
}

export const Empty: Story = { args: { data: [] } }
