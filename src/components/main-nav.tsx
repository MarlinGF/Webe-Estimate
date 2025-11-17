'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  Book,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/estimates', icon: FileText, label: 'Estimates' },
  { href: '/invoices', icon: Receipt, label: 'Invoices' },
  { href: '/clients', icon: Users, label: 'Clients' },
  { href: '/library', icon: Book, label: 'Library' },
  { href: '/projects', icon: Briefcase, label: 'WeBe Projects' },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <nav className="flex flex-col items-start gap-2 px-2 text-sm font-medium lg:px-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === '/dashboard' ? pathname === href : pathname.startsWith(href);
          return (
            <Tooltip key={href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-primary-foreground hover:bg-sidebar-accent group-[[data-state=collapsed]]:w-10 group-[[data-state=collapsed]]:justify-center',
                    isActive && 'bg-sidebar-accent text-primary-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="group-[[data-state=collapsed]]:hidden">{label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="hidden group-[[data-state=collapsed]]:block"
              >
                {label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
