"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useUser } from "@/hooks/use-user"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"

interface Snippet {
  id: string
  title: string
  language: string
  code: string
  createdAt: string
  collectionId?: string | null
}

interface Collection {
  id: string
  name: string
}

export default function DashboardPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [feed, setFeed] = useState<Snippet[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [feedLoading, setFeedLoading] = useState(true)
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (user) {
      async function loadData() {
        try {
          const [feedRes, collectionsRes] = await Promise.all([
            fetch("/api/feed"),
            fetch("/api/collections")
          ])

          if (feedRes.ok) {
            const data = await feedRes.json()
            setFeed(data)
          }

          if (collectionsRes.ok) {
            const collData = await collectionsRes.json()
            setCollections(collData)
          }
        } catch (error) {
          console.error("Failed to load dashboard data")
        } finally {
          setFeedLoading(false)
        }
      }
      loadData()
    }
  }, [user])

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return
    setIsCreatingCollection(true)
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCollectionName }),
      })
      if (res.ok) {
        const created = await res.json()
        setCollections(prev => [created, ...prev])
        setNewCollectionName("")
        setIsDialogOpen(false)
        toast.success("Collection créée !")
      }
    } catch (error) {
      toast.error("Erreur lors de la création")
    } finally {
      setIsCreatingCollection(false)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#020617]">
        <Icons.spinner className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  const filteredFeed = selectedCollectionId
    ? feed.filter(s => s.collectionId === selectedCollectionId)
    : feed

  return (
    <div className="min-h-screen bg-[#020617] py-10 selection:bg-purple-500/30">
      <div className="container px-6 lg:px-8 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Le Nexus des Geeks</h1>
            <p className="text-slate-400 mt-1">Gère tes collections et suis le flux.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl bg-white/5 border-white/10" asChild>
              <Link href="/profile">Mon Profil</Link>
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 rounded-xl" asChild>
              <Link href="/snippets/new">Nouveau Snippet</Link>
            </Button>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-4">
          {/* Sidebar avec Collections */}
          <div className="lg:col-span-1 space-y-8">
            <div className="glass-dark p-6 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Collections</h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-purple-500/20 text-purple-400">
                      <Icons.add className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader>
                      <DialogTitle>Nouvelle Collection</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <Input
                        placeholder="Nom de la collection (ex: Utilitaires React)"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        className="bg-slate-950/50 border-white/10"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleCreateCollection}
                        disabled={isCreatingCollection}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Créer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => setSelectedCollectionId(null)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${!selectedCollectionId ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 'hover:bg-white/5 text-slate-400'}`}
                >
                  <Icons.filter className="h-4 w-4" />
                  Tout le flux
                </button>
                {collections.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCollectionId(c.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selectedCollectionId === c.id ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 'hover:bg-white/5 text-slate-400'}`}
                  >
                    <Icons.folder className="h-4 w-4" />
                    {c.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="glass-dark p-6 rounded-2xl border border-white/5">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Raccourcis</h3>
              <nav className="flex flex-col gap-2">
                <Link href="/dashboard/chat" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-slate-300 transition-colors">
                  <Icons.message className="h-4 w-4 text-pink-400" />
                  GeekChat
                </Link>
                <Link href="/dashboard/leaderboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-slate-300 transition-colors">
                  <Icons.trophy className="h-4 w-4 text-yellow-500" />
                  Leaderboard
                </Link>
                <Link href="/explore" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-slate-300 transition-colors">
                  <Icons.search className="h-4 w-4 text-purple-400" />
                  Explorer
                </Link>
                <Link href="/playground" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-slate-300 transition-colors">
                  <Icons.code className="h-4 w-4 text-pink-400" />
                  Playground
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white border-l-4 border-purple-500 pl-4">
                {selectedCollectionId
                  ? `Collection: ${collections.find(c => c.id === selectedCollectionId)?.name}`
                  : "Flux des geeks suivis"}
              </h2>
            </div>

            {feedLoading ? (
              <div className="flex justify-center py-20">
                <Icons.spinner className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : filteredFeed.length > 0 ? (
              <div className="grid gap-6">
                {filteredFeed.map((snippet) => (
                  <div key={snippet.id} className="glass-dark rounded-2xl p-6 border border-white/5 hover:border-purple-500/20 transition-all group relative overflow-hidden">
                    {snippet.collectionId && (
                      <div className="absolute top-0 right-0 p-2">
                        <Icons.folder className="h-3 w-3 text-purple-500 opacity-50" />
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">{snippet.title}</h3>
                        <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">{snippet.language}</p>
                      </div>
                      <span className="text-[10px] text-slate-500">{new Date(snippet.createdAt).toLocaleDateString()}</span>
                    </div>
                    <pre className="p-4 rounded-xl bg-slate-950/80 text-slate-300 text-xs overflow-hidden max-h-[150px] border border-white/5 mb-4 font-mono">
                      <code>{snippet.code}</code>
                    </pre>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" className="text-xs hover:text-purple-400" asChild>
                        <Link href={`/snippets/${snippet.id}`}>Analyser</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 glass-dark rounded-2xl border border-dashed border-white/10">
                <Icons.folder className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Aucun snippet trouvé ici.</p>
                <p className="text-sm text-slate-500 mt-1 mb-6">
                  {selectedCollectionId ? "Cette collection est vide." : "Abonne-toi à des geeks pour voir leurs snippets."}
                </p>
                {!selectedCollectionId && (
                  <Button variant="outline" className="rounded-xl border-purple-500/50 text-purple-400" asChild>
                    <Link href="/explore">Explorer la communauté</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
