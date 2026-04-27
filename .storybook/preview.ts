import type { Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'zzz-dark',
      values: [
        { name: 'zzz-dark', value: '#0a0c14' },
        { name: 'zzz-card', value: '#0d0f17' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
