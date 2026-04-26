import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import React from 'react'

// next/image — render a plain <img>
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) =>
    React.createElement('img', props as React.ImgHTMLAttributes<HTMLImageElement>),
}))

// recharts — ResponsiveContainer measures DOM with ResizeObserver, which jsdom lacks
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
;(globalThis as unknown as { ResizeObserver: typeof ResizeObserverMock }).ResizeObserver =
  ResizeObserverMock
