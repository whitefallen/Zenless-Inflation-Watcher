'use client';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { ErrorBoundary } from '@/components/shared/error-boundary';

export function ShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  if (isHome) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <ErrorBoundary>
          <div className="container mx-auto py-12 px-4">
            {children}
          </div>
        </ErrorBoundary>
      </main>
    </>
  );
}
