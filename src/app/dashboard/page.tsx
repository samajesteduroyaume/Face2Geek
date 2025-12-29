"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useUser } from "@/hooks/use-user"
import { Icons } from "@/components/icons"
import { SignOutButton } from "@/components/auth/sign-out-button"

export default function DashboardPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [isLoading, user, router])

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container flex min-h-screen flex-col gap-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Bienvenue sur Face2Geek, {user.email}
          </p>
        </div>
        <SignOutButton />
      </header>

      <main className="mt-6 rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-muted-foreground">
          Tu es authentifié avec Supabase. Tu pourras plus tard voir ici ton feed,
          tes snippets, etc.
        </p>
      </main>
    </div>
  )
}
