import Link from 'next/link'
import { MainNav } from '@/components/navigation/main-nav'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#2b2b33] bg-[#0a0a0b]/94 backdrop-blur supports-[backdrop-filter]:bg-[#0a0a0b]/82">
      <div className="h-[3px] w-full bg-[#ffd400]" />
      <div className="mx-auto flex h-20 w-full max-w-[1500px] items-center gap-5 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-[#2b2b33] bg-[#131316]">
            <div className="h-5 w-5 bg-[#ffd400]" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[0.62rem] font-semibold tracking-normal text-[#ffd400] uppercase">ZZZ</span>
            <span className="font-display text-lg tracking-normal text-[#f4f4f0] transition-colors group-hover:text-[#ffd400]">
              Patrol Log
            </span>
          </div>
        </Link>
        <div className="h-8 w-px bg-[#2b2b33]" />
        <MainNav />
        <div className="ml-auto hidden items-center gap-3 sm:flex">
          <div className="text-right">
            <div className="text-[0.62rem] font-semibold tracking-normal text-[#8f919c] uppercase">Ops Board</div>
            <div className="font-display text-sm tracking-normal text-[#f4f4f0]">Cross-mode analytics</div>
          </div>
          <span className="zzz-stat-badge border-[#3a3a42] text-[#2be0ff]">Live</span>
        </div>
      </div>
    </header>
  )
}
