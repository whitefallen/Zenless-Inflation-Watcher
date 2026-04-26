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

// jsdom always reports 0×0 for layout boxes, which makes recharts ResponsiveContainer
// log a "width(0) and height(0)" warning. Stub the box size so charts mount cleanly.
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 800 })
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 400 })
Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 800 })
Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 400 })
