'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/deadly-assault', label: 'Deadly Assault', short: 'DA' },
  { href: '/shiyu-defense', label: 'Shiyu Defense', short: 'SD' },
  { href: '/void-front', label: 'Void Front', short: 'VF' },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-2 overflow-x-auto">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'relative border px-3 py-2 text-[0.72rem] font-semibold tracking-normal uppercase whitespace-nowrap',
              'transition-colors duration-200',
              isActive
                ? 'border-[#ffd400] bg-[#ffd400] text-[#0a0a0b]'
                : 'border-[#2b2b33] bg-[#131316] text-[#8f919c] hover:text-[#f4f4f0] hover:border-[#3a3a42]',
            ].join(' ')}
          >
            <span className="hidden sm:inline">{item.label}</span>
            <span className="sm:hidden">{item.short}</span>
          </Link>
        )
      })}
    </nav>
  )
}
