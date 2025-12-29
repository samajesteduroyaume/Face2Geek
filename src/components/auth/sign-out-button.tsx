"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()

    await supabase.auth.signOut()
    toast.success("Déconnecté avec succès")
    router.push("/login")
  }

  return (
    <Button variant="ghost" onClick={handleSignOut} className="text-sm">
      Se déconnecter
    </Button>
  )
}
