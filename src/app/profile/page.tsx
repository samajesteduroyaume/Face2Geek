"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { useUser } from "@/hooks/use-user"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import confetti from "canvas-confetti"

interface Badge {
  id: string
  name: string
  description: string
  icon: string
}

interface Profile {
  id: string
  full_name: string | null
  username: string | null
  bio: string | null
  badges: Badge[]
  stats: {
    snippetsCount: number
    likesReceived: number
  }
}

export default function ProfilePage() {
  const { user, isLoading } = useUser()
  const router = useRouter()

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
      try {
        const response = await fetch(`/api/profile`)
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
          if (data.badges && data.badges.length > 0) {
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#a855f7', '#ec4899', '#3b82f6']
            })
          }
        }
      } catch (error) {
        console.error(error)
        toast.error("Erreur lors du chargement du profil")
      } finally {
        setLoadingProfile(false)
      }
    }

    if (user) {
      loadProfile()
    }
  }, [user])

  const handleChange = (field: string, value: string) => {
    if (!profile) return
    setProfile({ ...profile, [field]: value } as Profile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return

    setSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })

      if (!response.ok) throw new Error("Erreur serveur")

      toast.success("Profil mis à jour ✅")
    } catch (err) {
      console.error(err)
      toast.error("Erreur lors de la mise à jour")
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !user || loadingProfile || !profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#020617]">
        <Icons.spinner className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="container py-10 selection:bg-purple-500/30 min-h-screen bg-[#020617]">
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <header className="space-y-2">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Mon Espace Geek</h1>
            <p className="text-slate-400">Gère ton identité et tes exploits sur Face2Geek.</p>
          </header>

          <form onSubmit={handleSubmit} className="glass-dark p-8 rounded-3xl border border-white/5 space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-slate-300">Nom Complet</Label>
                <Input
                  id="full_name"
                  className="bg-slate-950/50 border-white/10 text-white rounded-xl focus:ring-purple-500/50"
                  value={profile.full_name ?? ""}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">Pseudo unique</Label>
                <Input
                  id="username"
                  className="bg-slate-950/50 border-white/10 text-white rounded-xl focus:ring-purple-500/50"
                  value={profile.username ?? ""}
                  onChange={(e) => handleChange("username", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-slate-300">Bio / Stack</Label>
              <textarea
                id="bio"
                className="flex min-h-[120px] w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-inner shadow-black/20"
                placeholder="Décris ton expertise..."
                value={profile.bio ?? ""}
                onChange={(e) => handleChange("bio", e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700 rounded-xl px-8 shadow-lg shadow-purple-500/20">
                {saving ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.check className="mr-2 h-4 w-4" />}
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-8">
          <section className="glass-dark p-8 rounded-3xl border border-white/5 bg-gradient-to-b from-purple-500/5 to-transparent">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Icons.trophy className="h-5 w-5 text-yellow-500" />
              Récompenses
            </h2>
            {profile.badges.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {profile.badges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center text-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/20 transition-all group">
                    <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/5">
                      {/* On utilise dynamiquement l'icône si possible, sinon trophée */}
                      <Icons.trophy className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-bold text-white mb-1">{badge.name}</p>
                    <p className="text-[9px] text-slate-500 leading-tight">{badge.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500 italic">Aucun badge débloqué pour le moment. Continue de coder !</p>
              </div>
            )}
          </section>

          <section className="glass-dark p-8 rounded-3xl border border-white/5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Moteur de Réputation</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                <span className="text-sm text-slate-400">Snippets publiés</span>
                <span className="text-xl font-black text-white">{profile.stats.snippetsCount}</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                <span className="text-sm text-slate-400">Likes reçus</span>
                <span className="text-xl font-black text-pink-500">{profile.stats.likesReceived}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
