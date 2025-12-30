"use client"

import Link from 'next/link'

import { ThemeToggle } from '@/components/theme-toggle'
import { useUser } from '@/hooks/use-user'
import { Button } from '@/components/ui/button'
import { SignOutButton } from '@/components/auth/sign-out-button'

export function MainNav() {
  const { user, isLoading } = useUser()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold">Face2Geek</span>
          </Link>
          <nav className="hidden space-x-6 md:flex">
            <Link
              href="/explore"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Explore
            </Link>
            <Link
              href="/snippets"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Snippets
            </Link>
            <Link
              href="/playground"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Playground
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            {!isLoading && (
              user ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <SignOutButton />
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
