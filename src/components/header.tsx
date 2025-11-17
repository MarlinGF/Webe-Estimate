'use client';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { Menu, FileText } from 'lucide-react';
import Link from 'next/link';
import { useSidebar } from '@/components/ui/sidebar';

export function Header({ title }: { title?: string }) {
  const { isMobile } = useSidebar();
  return (
    <header className="flex h-16 items-center gap-4 border-b border-sidebar-border bg-sidebar text-sidebar-foreground px-4 md:px-6 sticky top-0 z-30">
        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-sidebar text-sidebar-foreground">
                <nav className="grid gap-6 text-lg font-medium">
                    <Link
                        href="#"
                        className="flex items-center gap-2 text-lg font-semibold mb-4"
                    >
                        <FileText className="h-6 w-6 text-primary" />
                        <span>WeBeEstimate</span>
                    </Link>
                    <MainNav />
                </nav>
                </SheetContent>
            </Sheet>
        </div>
      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <UserNav />
      </div>
    </header>
  );
}
