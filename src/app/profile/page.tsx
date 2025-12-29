"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

interface Profile {
  id: string
  full_name: string | null
  username: string | null
  bio: string | null
}

export default function ProfilePage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [isLoading, user, router])

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return
      setLoadingProfile(true)
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username, bio")
        .eq("id", user.id)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error(error)
        toast.error("Erreur lors du chargement du profil")
      }

      if (data) {
        setProfile(data as Profile)
      } else {
        // Profil inexistant : on initialise avec des valeurs par défaut
        setProfile({
          id: user.id,
          full_name: user.email ?? "",
          username: user.email?.split("@")[0] ?? "",
          bio: "",
        })
      }
      setLoadingProfile(false)
    }

    if (user) {
      loadProfile()
    }
  }, [user, supabase])

  const handleChange = (field: keyof Profile, value: string) => {
    if (!profile) return
    setProfile({ ...profile, [field]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return

    setSaving(true)
    try {
      const { error } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          full_name: profile.full_name,
          username: profile.username,
          bio: profile.bio,
        },
        { onConflict: "id" }
      )

      if (error) throw error
      toast.success("Profil mis à jour ✅")
    } catch (err) {
      console.error(err)
      toast.error("Erreur lors de la mise à jour du profil")
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !user || loadingProfile || !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container flex min-h-screen flex-col gap-6 py-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
        <p className="text-sm text-muted-foreground">
          Gère les informations de ton profil Face2Geek.
        </p>
      </header>

      <main className="mt-4 max-w-xl rounded-lg border bg-card p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nom complet</Label>
            <Input
              id="full_name"
              value={profile.full_name ?? ""}
              onChange={(e) => handleChange("full_name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Pseudo</Label>
            <Input
              id="username"
              value={profile.username ?? ""}
              onChange={(e) => handleChange("username", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Utilisé pour t'identifier dans la communauté (unique).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={profile.bio ?? ""}
              onChange={(e) => handleChange("bio", e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Sauvegarder
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
