"use client"

import { useEffect, useState, useRef } from "react"
import { Icons } from "@/components/icons"
import { useUser } from "@/hooks/use-user"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Message {
    id: string
    senderId: string
    content: string
    createdAt: string
}

interface Participant {
    id: string
    name: string
    image: string | null
    username: string | null
}

interface ChatWindowProps {
    conversationId: string
    participant: Participant
}

export function ChatWindow({ conversationId, participant }: ChatWindowProps) {
    const { user } = useUser()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [sending, setSending] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/conversations/${conversationId}/messages`)
            if (res.ok) {
                const data = await res.json()
                setMessages(data)
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchMessages()
        const interval = setInterval(fetchMessages, 3000) // Polling simple toutes les 3s
        return () => clearInterval(interval)
    }, [conversationId])

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || sending) return

        setSending(true)
        try {
            const res = await fetch(`/api/conversations/${conversationId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: input, recipientId: participant.id })
            })
            if (res.ok) {
                setInput("")
                fetchMessages()
            }
        } catch (error) {
            console.error(error)
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-slate-900/40">
            {/* Header */}
            <header className="p-4 border-b border-white/5 flex items-center gap-3 glass-dark">
                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                    {participant.image ? (
                        <img src={participant.image} alt={participant.name} className="h-full w-full object-cover" />
                    ) : (
                        <Icons.user className="h-5 w-5 text-slate-400" />
                    )}
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white">{participant.name || participant.username}</h3>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">En ligne</p>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-6 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 px-4 rounded-2xl text-sm ${msg.senderId === user?.id
                                    ? "bg-purple-600 text-white rounded-tr-none shadow-lg shadow-purple-500/10"
                                    : "bg-white/10 text-slate-200 rounded-tl-none border border-white/5"
                                }`}
                        >
                            {msg.content}
                            <p className={`text-[9px] mt-1 ${msg.senderId === user?.id ? "text-purple-200" : "text-slate-500"}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <footer className="p-4 border-t border-white/5 glass-dark">
                <form onSubmit={handleSend} className="flex gap-3">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Écris ton message..."
                        className="bg-slate-950/50 border-white/10 text-white rounded-xl focus:ring-purple-500/50"
                    />
                    <Button type="submit" disabled={sending} className="bg-purple-600 hover:bg-purple-700 rounded-xl px-4 shadow-lg shadow-purple-500/20">
                        {sending ? <Icons.spinner className="h-4 w-4 animate-spin" /> : <Icons.send className="h-4 w-4" />}
                    </Button>
                </form>
            </footer>
        </div>
    )
}
