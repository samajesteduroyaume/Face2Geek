"use client"

import { useEffect, useState } from "react"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuHeader,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import Link from "next/link"

interface Notification {
    id: string
    userId: string
    type: "LIKE" | "COMMENT" | "FOLLOW" | "RATE"
    actorId: string
    snippetId?: string | null
    isRead: boolean
    createdAt: string
}

export function NotificationsBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    const unreadCount = notifications.filter(n => !n.isRead).length

    const loadNotifications = async () => {
        try {
            const res = await fetch("/api/notifications")
            if (res.ok) {
                const data = await res.json()
                setNotifications(data)
            }
        } catch (error) {
            console.error("Failed to load notifications")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadNotifications()
        // Rafraîchir toutes les minutes
        const interval = setInterval(loadNotifications, 60000)
        return () => clearInterval(interval)
    }, [])

    const markAsRead = async (id?: string) => {
        try {
            const res = await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(id ? { id } : { all: true }),
            })
            if (res.ok) {
                if (id) {
                    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
                } else {
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
                }
            }
        } catch (error) {
            toast.error("Erreur lors du marquage")
        }
    }

    const getNotificationMessage = (n: Notification) => {
        const actor = `Geek #${n.actorId.slice(0, 4)}`
        switch (n.type) {
            case "LIKE": return `${actor} a aimé ton snippet.`
            case "COMMENT": return `${actor} a commenté ton snippet.`
            case "FOLLOW": return `${actor} s'est abonné à toi.`
            case "RATE": return `${actor} a noté ton snippet.`
            default: return "Nouvelle interaction."
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-white/5 text-slate-400">
                    <Icons.bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500 text-[10px] text-white font-bold items-center justify-center">
                                {unreadCount}
                            </span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-slate-900 border-white/10 text-white p-2">
                <div className="flex items-center justify-between px-2 py-4">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400">Notifications</h3>
                    {unreadCount > 0 && (
                        <button onClick={() => markAsRead()} className="text-[10px] text-purple-400 hover:text-purple-300">
                            Tout marquer comme lu
                        </button>
                    )}
                </div>
                <DropdownMenuSeparator className="bg-white/5" />
                <div className="max-h-[300px] overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Icons.spinner className="h-4 w-4 animate-spin text-purple-500" />
                        </div>
                    ) : notifications.length > 0 ? (
                        notifications.map(n => (
                            <DropdownMenuItem
                                key={n.id}
                                className={`flex flex-col items-start gap-1 p-3 cursor-pointer outline-none transition-colors ${n.isRead ? 'opacity-60' : 'bg-purple-500/5 focus:bg-purple-500/10'}`}
                                onClick={() => markAsRead(n.id)}
                            >
                                <p className="text-xs">{getNotificationMessage(n)}</p>
                                <span className="text-[10px] text-slate-500">{new Date(n.createdAt).toLocaleDateString()}</span>
                                {n.snippetId && (
                                    <Link href={`/snippets/${n.snippetId}`} className="text-[10px] text-purple-400 mt-1 hover:underline">
                                        Voir le snippet
                                    </Link>
                                )}
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-500 text-xs italic">
                            Aucune notification pour le moment.
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
