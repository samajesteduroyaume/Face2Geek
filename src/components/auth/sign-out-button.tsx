"use client"

import { signOut } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" })
    toast.success("Déconnecté avec succès")
  }

  return (
    <Button variant="ghost" onClick={handleSignOut} className="text-sm">
      Se déconnecter
    </Button>
  )
}


