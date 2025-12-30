"use client"

import { useState } from "react"
import { ChatInbox } from "@/components/chat-inbox"
import { ChatWindow } from "@/components/chat-window"

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

export default function ChatPage() {
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)

    return (
        <div className="container py-8 h-[calc(100vh-100px)]">
            <div className="glass-dark h-full rounded-3xl border border-white/5 overflow-hidden flex shadow-2xl">
                <aside className="w-full md:w-80 h-full flex-shrink-0">
                    <ChatInbox
                        onSelectConversation={setActiveConversation}
                        selectedId={activeConversation?.id}
                    />
                </aside>
                <main className="hidden md:flex flex-1 h-full">
                    {activeConversation ? (
                        <ChatWindow
                            conversationId={activeConversation.id}
                            participant={activeConversation.participant}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-950/20">
                            <div className="h-20 w-20 rounded-full bg-slate-900 flex items-center justify-center mb-4 border border-white/5">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500/50">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                            <p className="text-sm italic font-medium">Sélectionne une discussion pour commencer à geeker.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
