'use client';

import { Header } from '@/components/header';
import { MainNav } from '@/components/main-nav';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { SidebarProvider } from '@/components/ui/sidebar';
import { FirebaseClientProvider, useFirebase } from '@/firebase';
import { EstimatorSessionProvider, useEstimatorSession } from '@/context/estimator-session';

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useFirebase();
  const { status, error } = useEstimatorSession();

  const isLoadingState = isUserLoading || status === 'waiting' || status === 'authenticating';
  const shouldBlockContent = !isLoadingState && !user && status !== 'standalone';

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-sidebar md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-16 items-center border-b-[hsl(var(--sidebar-border))] px-4 lg:px-6">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
                <FileText className="h-6 w-6 text-primary" />
                <span className="">WeBeEstimate</span>
              </Link>
            </div>
            <div className="flex-1">
              <MainNav />
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/40">
            {isLoadingState && (
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                Waiting for WeBe session...
              </div>
            )}
            {shouldBlockContent && (
              <div className="flex flex-1 items-center justify-center text-sm text-destructive">
                {error || 'Unable to authenticate with the WeBe session. Please reopen from the main app.'}
              </div>
            )}
            {!isLoadingState && (user || status === 'standalone') ? children : null}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <EstimatorSessionProvider>
        <AppContent>{children}</AppContent>
      </EstimatorSessionProvider>
    </FirebaseClientProvider>
  );
}
