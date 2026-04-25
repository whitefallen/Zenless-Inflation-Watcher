import { MainNav } from '@/components/navigation/main-nav'
import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1e2438] bg-[#08090d]/95 backdrop-blur supports-[backdrop-filter]:bg-[#08090d]/80">
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#f5c842] to-transparent opacity-60" />
      <div className="container flex h-14 items-center gap-6 px-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative w-7 h-7 shrink-0">
            <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <polygon points="2,6 18,6 16,10 2,10" fill="#f5c842" />
              <polygon points="7,12 21,12 19,16 5,16" fill="#f5c842" opacity="0.65" />
              <polygon points="10,18 26,18 24,22 8,22" fill="#f5c842" opacity="0.35" />
            </svg>
          </div>
          <div className="flex flex-col leading-none gap-0.5">
            <span className="text-[9px] font-bold tracking-[0.25em] text-[#f5c842]/50 uppercase">ZZZ</span>
            <span className="text-sm font-black tracking-tight text-[#e8e0cc] group-hover:text-[#f5c842] transition-colors">
              Battle Records
            </span>
          </div>
        </Link>
        <div className="h-5 w-px bg-[#1e2438]" />
        <MainNav />
        <div className="ml-auto hidden sm:flex items-center">
          <span
            className="text-[9px] font-black tracking-[0.2em] uppercase text-[#00d4ff]/60 border border-[#1e2438] px-2 py-0.5"
            style={{ clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))' }}
          >
            Analytics
          </span>
        </div>
      </div>
    </header>
  )
}
