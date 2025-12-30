"use client"

import { useEffect, useState } from "react"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Geek {
    id: string
    name: string
    username: string
    image: string
    snippetCount: number
    totalLikes: number
    avgRating: number
    totalViews: number
}

export default function LeaderboardPage() {
    const [geeks, setGeeks] = useState<Geek[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadLeaderboard = async () => {
            try {
                const res = await fetch("/api/leaderboard")
                if (res.ok) {
                    const data = await res.json()
                    setGeeks(data)
                }
            } catch (error) {
                console.error("Failed to load leaderboard")
            } finally {
                setLoading(false)
            }
        }
        loadLeaderboard()
    }, [])

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Icons.spinner className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
                    <Icons.trophy className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Panthéon des Geeks</h2>
                    <p className="text-slate-400">Les contributeurs les plus influents de l'écosystème.</p>
                </div>
            </div>

            <div className="grid gap-4">
                {geeks.map((geek, index) => (
                    <div
                        key={geek.id}
                        className={`glass-dark p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-purple-500/30 group ${index === 0 ? 'bg-gradient-to-r from-purple-500/10 to-transparent border-purple-500/30' : ''}`}
                    >
                        <div className="flex items-center gap-6">
                            <span className={`text-2xl font-black italic ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-400' : 'text-slate-600'}`}>
                                #{index + 1}
                            </span>
                            <div className="h-16 w-16 rounded-full bg-slate-800 border-2 border-white/5 overflow-hidden flex items-center justify-center text-xl font-bold text-white uppercase group-hover:border-purple-500/50 transition-colors">
                                {geek.image ? <img src={geek.image} alt={geek.name} /> : geek.name ? geek.name.charAt(0) : <Icons.user className="h-6 w-6" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white">{geek.name || "Geek Anonyme"}</h3>
                                <p className="text-sm text-purple-400">@{geek.username || "anonymous"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 md:gap-12">
                            <div className="text-center">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Snippets</p>
                                <p className="text-lg font-bold text-white">{geek.snippetCount}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Likes</p>
                                <p className="text-lg font-bold text-white">{geek.totalLikes}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Vues</p>
                                <p className="text-lg font-bold text-white">{Math.round(geek.totalViews)}</p>
                            </div>
                            <div className="hidden sm:block">
                                <Button variant="outline" className="rounded-xl bg-white/5 border-white/10 hover:text-purple-400" asChild>
                                    <Link href={`/profile/${geek.username}`}>Consulter</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
