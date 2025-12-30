"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Profile {
    id: string
    full_name: string
    username: string
    bio: string
}

interface Snippet {
    id: string
    title: string
    language: string
    code: string
    tags?: string[]
    views?: number
}

export default function ExplorePage() {
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [snippets, setSnippets] = useState<Snippet[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const [profilesRes, snippetsRes] = await Promise.all([
                    fetch("/api/profiles"),
                    fetch("/api/snippets")
                ])

                if (profilesRes.ok && snippetsRes.ok) {
                    const profilesData = await profilesRes.json()
                    const snippetsData = await snippetsRes.json()
                    setProfiles(profilesData)
                    setSnippets(snippetsData)
                }
            } catch (error) {
                toast.error("Erreur lors du chargement des données")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const filteredProfiles = profiles.filter(p =>
        (p.username?.toLowerCase().includes(search.toLowerCase())) ||
        (p.full_name?.toLowerCase().includes(search.toLowerCase()))
    )

    const filteredSnippets = snippets.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.language.toLowerCase().includes(search.toLowerCase()) ||
        s.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    )

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#020617]">
                <Icons.spinner className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#020617] py-10 selection:bg-purple-500/30">
            <div className="container px-6 lg:px-8">
                <div className="flex flex-col gap-10">
                    <section>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                            <div>
                                <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Explorer la Communauté</h1>
                                <p className="text-slate-400">Découvrez les développeurs passionnés et leurs meilleures créations.</p>
                            </div>
                            <div className="relative w-full md:w-96">
                                <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par nom, langage ou tag (#)..."
                                    className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {filteredProfiles.length > 0 ? (
                                filteredProfiles.slice(0, 8).map((profile) => (
                                    <div key={profile.id} className="glass-dark rounded-2xl p-6 border border-white/5 hover:bg-white/5 transition-all duration-300">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl uppercase">
                                                {profile.username?.charAt(0) || "G"}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white truncate max-w-[120px]">{profile.full_name || "Utilisateur"}</h3>
                                                <p className="text-xs text-purple-400 font-mono">@{profile.username || "geek"}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-400 line-clamp-2 mb-4 h-10">
                                            {profile.bio || "Ce geek n'a pas encore rédigé sa bio..."}
                                        </p>
                                        <Button variant="ghost" className="w-full text-xs hover:text-purple-400" asChild>
                                            <Link href={`/profile/${profile.username}`}>Voir le profil</Link>
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-10 text-center text-slate-500 italic">
                                    Aucun geek correspondant à votre recherche.
                                </div>
                            )}
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white">Derniers Snippets</h2>
                            <Link href="/snippets" className="text-sm text-purple-400 hover:underline">Voir tout</Link>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {(search ? filteredSnippets : [...snippets].sort((a, b) => (b.views || 0) - (a.views || 0))).slice(0, 6).map((snippet) => (
                                <div key={snippet.id} className="glass-dark rounded-2xl overflow-hidden border border-white/5 group hover:border-purple-500/30 transition-all duration-300">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors truncate max-w-[200px]">{snippet.title}</h3>
                                            <span className="text-[10px] font-mono px-2 py-1 bg-purple-500/10 text-purple-400 rounded-full uppercase tracking-widest border border-purple-500/20">
                                                {snippet.language}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            {snippet.tags?.map(tag => (
                                                <span key={tag} className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded italic">#{tag}</span>
                                            ))}
                                            <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                                                <Icons.eye className="h-3 w-3" />
                                                {snippet.views || 0}
                                            </div>
                                        </div>
                                        <pre className="p-4 rounded-xl bg-slate-950/80 text-slate-300 text-[10px] overflow-hidden max-h-[120px] font-mono border border-white/5">
                                            <code>{snippet.code}</code>
                                        </pre>
                                    </div>
                                    <div className="px-6 py-3 bg-white/5 flex justify-end">
                                        <Button variant="ghost" size="sm" className="text-xs group-hover:bg-purple-600 group-hover:text-white transition-all" asChild>
                                            <Link href={`/snippets/${snippet.id}`}>Analyser le code</Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
