"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Profile {
    id: string
    full_name: string
    username: string
    bio: string
    github_url?: string
    website_url?: string
    twitter_url?: string
}

interface Snippet {
    id: string
    title: string
    language: string
    code: string
    userId: string
    createdAt: string
}

interface FollowStats {
    followerCount: number
    followingCount: number
    isFollowing: boolean
}

export default function PublicProfilePage() {
    const { username } = useParams()
    const router = useRouter()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [snippets, setSnippets] = useState<Snippet[]>([])
    const [stats, setStats] = useState<FollowStats>({ followerCount: 0, followingCount: 0, isFollowing: false })
    const [loading, setLoading] = useState(true)
    const [followLoading, setFollowLoading] = useState(false)

    useEffect(() => {
        async function loadProfileData() {
            try {
                // Charger le profil et ses stats de follow
                const [profilesRes, snippetsRes, followRes] = await Promise.all([
                    fetch("/api/profiles"),
                    fetch("/api/snippets"),
                    fetch(`/api/profiles/${username}/follow`)
                ])

                if (profilesRes.ok && snippetsRes.ok) {
                    const allProfiles: Profile[] = await profilesRes.json()
                    const allSnippets: Snippet[] = await snippetsRes.json()

                    const foundProfile = allProfiles.find(p => p.username === username)
                    if (foundProfile) {
                        setProfile(foundProfile)
                        setSnippets(allSnippets.filter(s => s.userId === foundProfile.id))
                    } else {
                        toast.error("Profil non trouvé")
                        router.push("/explore")
                    }
                }

                if (followRes.ok) {
                    const followData = await followRes.json()
                    setStats(followData)
                }
            } catch (error) {
                toast.error("Erreur serveur")
            } finally {
                setLoading(false)
            }
        }
        loadProfileData()
    }, [username, router])

    const handleFollow = async () => {
        setFollowLoading(true)
        try {
            const res = await fetch(`/api/profiles/${username}/follow`, { method: "POST" })
            if (res.status === 401) {
                toast.error("Connecte-toi pour suivre ce geek !")
                return
            }
            if (res.ok) {
                const { following } = await res.json()
                setStats(prev => ({
                    ...prev,
                    followerCount: following ? prev.followerCount + 1 : prev.followerCount - 1,
                    isFollowing: following
                }))
                toast.success(following ? `Tu suis maintenant ${username} !` : `Tu ne suis plus ${username}.`)
            }
        } catch (error) {
            toast.error("Une erreur est survenue")
        } finally {
            setFollowLoading(false)
        }
    }

    if (loading || !profile) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#020617]">
                <Icons.spinner className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#020617] py-10 selection:bg-purple-500/30">
            <div className="container px-6 lg:px-8">
                <div className="flex flex-col gap-12">
                    {/* Header Profil avec Follow et Social */}
                    <div className="glass-dark rounded-3xl p-8 border border-white/5 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 flex gap-2">
                            {profile.github_url && (
                                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                                    <Icons.gitHub className="h-5 w-5 text-slate-400" />
                                </a>
                            )}
                            {profile.twitter_url && (
                                <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-slate-400">
                                    𝕏
                                </a>
                            )}
                        </div>

                        <div className="h-32 w-32 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white font-extrabold text-5xl shadow-2xl shadow-purple-500/20">
                            {profile.username?.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                                <h1 className="text-4xl font-extrabold text-white">{profile.full_name}</h1>
                                <Button
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                    variant={stats.isFollowing ? "outline" : "default"}
                                    className={`rounded-full px-6 h-9 text-xs font-bold transition-all ${stats.isFollowing ? 'border-purple-500/50 text-purple-400 hover:bg-purple-500/10' : 'bg-purple-600 hover:bg-purple-700'}`}
                                >
                                    {followLoading && <Icons.spinner className="mr-2 h-3 w-3 animate-spin" />}
                                    {stats.isFollowing ? "Suivi" : "Suivre"}
                                </Button>
                                <Button
                                    onClick={async () => {
                                        try {
                                            const res = await fetch("/api/conversations", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ recipientId: profile.id })
                                            })
                                            if (res.ok) {
                                                router.push("/dashboard/chat")
                                            }
                                        } catch (error) {
                                            toast.error("Impossible de démarrer la discussion")
                                        }
                                    }}
                                    variant="outline"
                                    className="rounded-full px-6 h-9 text-xs font-bold border-white/10 hover:bg-white/5 text-slate-300"
                                >
                                    <Icons.message className="mr-2 h-3 w-3" />
                                    Message
                                </Button>
                            </div>
                            <p className="text-purple-400 font-mono text-lg mb-4">@{profile.username}</p>

                            <div className="flex justify-center md:justify-start gap-6 mb-4">
                                <div className="text-center md:text-left">
                                    <span className="block text-xl font-bold text-white">{stats.followerCount}</span>
                                    <span className="text-xs text-slate-500 uppercase tracking-tighter">Abonnés</span>
                                </div>
                                <div className="text-center md:text-left">
                                    <span className="block text-xl font-bold text-white">{stats.followingCount}</span>
                                    <span className="text-xs text-slate-500 uppercase tracking-tighter">Abonnements</span>
                                </div>
                                <div className="text-center md:text-left">
                                    <span className="block text-xl font-bold text-white">{snippets.length}</span>
                                    <span className="text-xs text-slate-500 uppercase tracking-tighter">Snippets</span>
                                </div>
                            </div>

                            <p className="text-slate-400 max-w-2xl leading-relaxed">
                                {profile.bio || "Ce explorateur du code n'a pas encore rédigé sa bio..."}
                            </p>

                            {profile.website_url && (
                                <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center text-sm text-purple-400 hover:underline">
                                    <Icons.link className="mr-2 h-4 w-4" />
                                    {profile.website_url.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Snippets de l'utilisateur */}
                    <div>
                        <div className="flex items-center justify-between mb-8 border-l-4 border-purple-500 pl-4 ml-2">
                            <h2 className="text-2xl font-bold text-white">Le Scriptorium de {profile.username}</h2>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {snippets.length > 0 ? (
                                snippets.map((snippet) => (
                                    <div key={snippet.id} className="glass-dark rounded-2xl overflow-hidden border border-white/5 group hover:border-purple-500/30 transition-all duration-300">
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-white group-hover:text-purple-400 truncate">{snippet.title}</h3>
                                                <span className="text-[10px] font-mono px-2 py-1 bg-purple-500/10 text-purple-400 rounded-full uppercase">
                                                    {snippet.language}
                                                </span>
                                            </div>
                                            <pre className="p-4 rounded-xl bg-slate-950/80 text-slate-300 text-[10px] overflow-hidden max-h-[100px] border border-white/5 font-mono">
                                                <code>{snippet.code}</code>
                                            </pre>
                                        </div>
                                        <div className="px-6 py-3 bg-white/5">
                                            <Button variant="ghost" size="sm" className="w-full text-xs hover:bg-purple-600 hover:text-white" asChild>
                                                <Link href={`/snippets/${snippet.id}`}>Analyser le code</Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 glass-dark rounded-2xl border border-dashed border-white/10 text-center">
                                    <p className="text-slate-500 italic">Aucun snippet public pour le moment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
