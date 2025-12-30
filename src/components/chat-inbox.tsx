"use client"

import { useEffect, useState } from "react"
import { Icons } from "@/components/icons"

interface Participant {
    id: string
    name: string
    image: string | null
    username: string | null
}

interface Conversation {
    id: string
    participant: Participant
}

interface ChatInboxProps {
    onSelectConversation: (conv: Conversation) => void
    selectedId?: string
}

export function ChatInbox({ onSelectConversation, selectedId }: ChatInboxProps) {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await fetch("/api/conversations")
                if (res.ok) {
                    const data = await res.json()
                    setConversations(data)
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchConversations()
    }, [])

    if (loading) return <div className="p-4 text-center"><Icons.spinner className="h-6 w-6 animate-spin mx-auto text-purple-500" /></div>

    return (
        <div className="flex flex-col h-full border-r border-white/5 bg-slate-950/20">
            <div className="p-6 border-b border-white/5">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Icons.message className="h-5 w-5 text-purple-400" />
                    Messages
                </h2>
            </div>
            <div className="flex-1 overflow-auto p-2 space-y-1">
                {conversations.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 italic text-sm">
                        Aucune discussion en cours.
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => onSelectConversation(conv)}
                            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${selectedId === conv.id ? "bg-purple-600/20 border border-purple-500/30 shadow-lg shadow-purple-500/10" : "hover:bg-white/5 border border-transparent"}`}
                        >
                            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                                {conv.participant.image ? (
                                    <img src={conv.participant.image} alt={conv.participant.name} className="h-full w-full object-cover" />
                                ) : (
                                    <Icons.user className="h-5 w-5 text-slate-400" />
                                )}
                            </div>
                            <div className="text-left overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">{conv.participant.name || conv.participant.username}</p>
                                <p className="text-[10px] text-slate-500 truncate">Cliquez pour voir les messages</p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    )
}
