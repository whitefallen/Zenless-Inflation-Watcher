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
    <nav className="flex items-center gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'relative px-3 py-1.5 text-xs font-bold tracking-wider uppercase',
              'transition-all duration-200',
              isActive
                ? 'text-[#f5c842] bg-[#f5c842]/8'
                : 'text-[#6b7280] hover:text-[#e8e0cc] hover:bg-[#1e2130]',
            ].join(' ')}
            style={{
              clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
            }}
          >
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f5c842]"
                style={{ boxShadow: '0 0 6px #f5c842' }}
              />
            )}
            <span className="hidden sm:inline">{item.label}</span>
            <span className="sm:hidden">{item.short}</span>
          </Link>
        )
      })}
    </nav>
  )
}
