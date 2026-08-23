"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, Wrench } from "lucide-react";
import { MODULES } from "@/lib/modules";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {MODULES.map((mod) => {
        const isActive = pathname.startsWith(mod.href);
        const Icon = mod.icon;
        return (
          <Link
            key={mod.slug}
            href={mod.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            <Icon className="size-4" />
            {mod.label}
          </Link>
        );
      })}
    </>
  );
}

export function DashboardHeader({ userEmail }: { userEmail: string | null }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-14 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-1">
          {/* Mobile: menu laterale + bottone home */}
          <Sheet>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="md:hidden" />}
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Wrench className="size-4" />
                  Gestionale
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-2">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            title="Home"
            nativeButton={false}
            render={<Link href="/" />}
          >
            <Wrench className="size-4" />
          </Button>

          {/* Desktop: logo + nome app */}
          <Link href="/" className="hidden items-center gap-2 font-semibold md:flex">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Wrench className="size-4" />
            </span>
            <span>Gestionale</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-2">
          {userEmail && (
            <span className="hidden text-sm text-muted-foreground lg:inline">{userEmail}</span>
          )}
          <form action={logout}>
            <Button type="submit" variant="ghost" size="icon" title="Esci">
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
