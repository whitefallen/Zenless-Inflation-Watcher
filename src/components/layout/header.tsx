import { MainNav } from '@/components/navigation/main-nav'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center ps-6">
        <div className="mr-4 flex">
          <h1 className="text-xl font-semibold">ZZZ Battle Records</h1>
        </div>
        <MainNav />
      </div>
    </header>
  )
}
