"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Snippet {
    id: string
    title: string
    language: string
    code: string
    createdAt: string
}

export default function SnippetsPage() {
    const [snippets, setSnippets] = useState<Snippet[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchSnippets() {
            try {
                const response = await fetch("/api/snippets")
                if (response.ok) {
                    const data = await response.json()
                    setSnippets(data)
                }
            } catch (error) {
                toast.error("Erreur lors du chargement des snippets")
            } finally {
                setIsLoading(false)
            }
        }
        fetchSnippets()
    }, [])

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Snippets Communautaires</h1>
                    <p className="text-muted-foreground">Découvre et partage des morceaux de code utiles.</p>
                </div>
                <Button asChild>
                    <Link href="/snippets/new">
                        <Icons.add className="mr-2 h-4 w-4" />
                        Nouveau Snippet
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {snippets.length > 0 ? (
                    snippets.map((snippet) => (
                        <div key={snippet.id} className="rounded-lg border bg-card p-6 shadow-sm flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-lg truncate">{snippet.title}</h3>
                                    <span className="text-xs font-mono px-2 py-1 bg-muted rounded uppercase">
                                        {snippet.language}
                                    </span>
                                </div>
                                <pre className="p-4 rounded bg-slate-950 text-slate-50 text-xs overflow-hidden max-h-[150px]">
                                    <code>{snippet.code}</code>
                                </pre>
                            </div>
                            <Button variant="ghost" className="mt-4 w-full" asChild>
                                <Link href={`/snippets/${snippet.id}`}>Voir plus</Link>
                            </Button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Aucun snippet trouvé. Soyez le premier à en créer un !</p>
                    </div>
                )}
            </div>
        </div>
    )
}
