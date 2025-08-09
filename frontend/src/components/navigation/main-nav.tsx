'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-6">
      <Link
        href="/deadly-assault"
        className={`text-sm font-medium transition-colors hover:text-primary ${
          pathname === '/deadly-assault'
            ? 'text-foreground'
            : 'text-foreground/60'
        }`}
      >
        Deadly Assault
      </Link>
      <Link
        href="/shiyu-defense"
        className={`text-sm font-medium transition-colors hover:text-primary ${
          pathname === '/shiyu-defense'
            ? 'text-foreground'
            : 'text-foreground/60'
        }`}
      >
        Shiyu Defense
      </Link>
    </nav>
  )
}
