"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Editor from "@monaco-editor/react"
import { useTheme } from "next-themes"

import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { CodePreview } from "@/components/code-preview"

interface Comment {
    id: string
    content: string
    userId: string
    createdAt: string
}

interface Snippet {
    id: string
    title: string
    code: string
    language: string
    userId?: string
    tags?: string[]
    views?: number
    createdAt: string
}

interface Rating {
    average: number
    count: number
}

export default function SnippetDetailsPage() {
    const { id } = useParams()
    const router = useRouter()
    const { theme } = useTheme()
    const [snippet, setSnippet] = useState<Snippet | null>(null)
    const [loading, setLoading] = useState(true)
    const [likes, setLikes] = useState({ count: 0, userLiked: false })
    const [comments, setComments] = useState<Comment[]>([])
    const [rating, setRating] = useState<Rating>({ average: 0, count: 0 })
    const [userRating, setUserRating] = useState(0)
    const [newComment, setNewComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isRating, setIsRating] = useState(false)
    const [viewMode, setViewMode] = useState<"editor" | "preview">("editor")
    const [aiExplanation, setAiExplanation] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    useEffect(() => {
        async function loadData() {
            try {
                const [snippetRes, likesRes, commentsRes, ratingRes] = await Promise.all([
                    fetch(`/api/snippets/${id}`),
                    fetch(`/api/snippets/${id}/like`),
                    fetch(`/api/snippets/${id}/comments`),
                    fetch(`/api/snippets/${id}/rate`)
                ])

                if (snippetRes.ok) {
                    const data = await snippetRes.json()
                    setSnippet(data)
                } else {
                    toast.error("Snippet non trouvé")
                    router.push("/snippets")
                }

                if (likesRes.ok) {
                    const likesData = await likesRes.json()
                    setLikes(likesData)
                }

                if (commentsRes.ok) {
                    const commentsData = await commentsRes.json()
                    setComments(commentsData)
                }

                if (ratingRes.ok) {
                    const ratingData = await ratingRes.json()
                    setRating(ratingData)
                }

                // Incrémenter les vues
                fetch(`/api/snippets/${id}/view`, { method: "POST" })
            } catch (error) {
                toast.error("Erreur serveur")
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [id, router])

    const toggleLike = async () => {
        try {
            const res = await fetch(`/api/snippets/${id}/like`, { method: "POST" })
            if (res.status === 401) {
                toast.error("Connecte-toi pour liker ce snippet !")
                return
            }
            if (res.ok) {
                const { liked } = await res.json()
                setLikes(prev => ({
                    count: liked ? prev.count + 1 : prev.count - 1,
                    userLiked: liked
                }))
            }
        } catch (error) {
            toast.error("Erreur lors de l'interaction")
        }
    }

    const handleRate = async (score: number) => {
        setIsRating(true)
        try {
            const res = await fetch(`/api/snippets/${id}/rate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ score }),
            })
            if (res.status === 401) {
                toast.error("Connecte-toi pour noter !")
                return
            }
            if (res.ok) {
                setUserRating(score)
                toast.success(`Tu as donné ${score} étoiles !`)
                // Rafraîchir la moyenne
                const ratingRes = await fetch(`/api/snippets/${id}/rate`)
                if (ratingRes.ok) {
                    const ratingData = await ratingRes.json()
                    setRating(ratingData)
                }
            }
        } catch (error) {
            toast.error("Erreur lors de la notation")
        } finally {
            setIsRating(false)
        }
    }

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/snippets/${id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment }),
            })

            if (res.status === 401) {
                toast.error("Connecte-toi pour commenter !")
                return
            }

            if (res.ok) {
                const addedComment = await res.json()
                setComments(prev => [addedComment, ...prev])
                setNewComment("")
                toast.success("Commentaire ajouté !")
            }
        } catch (error) {
            toast.error("Erreur lors de l'envoi")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading || !snippet) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#020617]">
                <Icons.spinner className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        )
    }

    return (
        <div className="container py-10 selection:bg-purple-500/30 min-h-screen bg-[#020617]">
            <div className="flex flex-col space-y-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-4 text-slate-500 hover:text-white">
                            <Icons.chevronLeft className="mr-2 h-4 w-4" />
                            Retour
                        </Button>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white">{snippet.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-yellow-500">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => handleRate(star)}
                                        disabled={isRating}
                                        className="hover:scale-125 transition-transform"
                                    >
                                        <Icons.star className={`h-4 w-4 ${star <= (userRating || Math.round(rating.average)) ? 'fill-current' : 'text-slate-600'}`} />
                                    </button>
                                ))}
                                <span className="ml-2 text-xs text-slate-400">({rating.count} notes)</span>
                            </div>
                            <span className="text-[10px] font-mono px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full uppercase tracking-widest border border-purple-500/20">
                                {snippet.language}
                            </span>
                            {snippet.tags?.map(tag => (
                                <span key={tag} className="text-[10px] font-mono px-2 py-0.5 bg-white/5 text-slate-400 rounded border border-white/5 lowercase">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant={likes.userLiked ? "default" : "outline"}
                            className={`rounded-full px-6 h-10 transition-all ${likes.userLiked ? 'bg-pink-600 hover:bg-pink-700 border-pink-700 text-white' : 'hover:border-pink-500/50 hover:text-pink-400 bg-white/5 border-white/10 text-slate-300'}`}
                            onClick={toggleLike}
                        >
                            <Icons.heart className={`mr-2 h-4 w-4 ${likes.userLiked ? 'fill-current' : ''}`} />
                            {likes.count} Likes
                        </Button>
                        <Button variant="outline" className="rounded-full h-10 bg-white/5 border-white/10 text-slate-300" onClick={() => {
                            navigator.clipboard.writeText(snippet.code)
                            toast.success("Code copié !")
                        }}>
                            <Icons.check className="mr-2 h-4 w-4" />
                            Copier
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setViewMode("editor")}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "editor" ? "bg-purple-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                        >
                            Éditeur
                        </button>
                        <button
                            onClick={() => setViewMode("preview")}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "preview" ? "bg-purple-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                        >
                            Exécution
                        </button>
                    </div>

                    <Button
                        onClick={async () => {
                            setIsAnalyzing(true)
                            try {
                                const res = await fetch("/api/ai/explain", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ code: snippet.code, language: snippet.language })
                                })
                                if (res.ok) {
                                    const data = await res.json()
                                    setAiExplanation(data.explanation)
                                    toast.success("Analyse IA terminée !")
                                }
                            } catch (error) {
                                toast.error("L'IA est momentanément indisponible")
                            } finally {
                                setIsAnalyzing(false)
                            }
                        }}
                        disabled={isAnalyzing}
                        variant="outline"
                        className="rounded-xl border-purple-500/50 text-purple-400 hover:bg-purple-500/10 h-8 text-xs"
                    >
                        {isAnalyzing ? <Icons.spinner className="mr-2 h-3 w-3 animate-spin" /> : <Icons.code className="mr-2 h-3 w-3" />}
                        Expliquer par l'IA
                    </Button>
                    <Button
                        onClick={async () => {
                            const res = await fetch(`/api/snippets/${snippet.id}/export`, { method: "POST" })
                            if (res.ok) {
                                const data = await res.json()
                                toast.success(data.message, {
                                    action: {
                                        label: "Voir sur GitHub",
                                        onClick: () => window.open(data.url, "_blank")
                                    }
                                })
                            }
                        }}
                        variant="outline"
                        className="rounded-xl border-white/10 text-slate-400 hover:text-white hover:bg-white/5 h-8 text-xs"
                    >
                        <Icons.gitHub className="mr-2 h-3 w-3" />
                        Gist
                    </Button>
                </div>

                {aiExplanation && (
                    <div className="mb-6 p-6 glass-dark rounded-2xl border border-purple-500/20 bg-purple-500/5 animate-in fade-in slide-in-from-top-4">
                        <h3 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
                            <Icons.laptop className="h-4 w-4" />
                            Analyse Technique Face2Geek IA
                        </h3>
                        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {aiExplanation}
                        </div>
                    </div>
                )}

                <div className="glass-dark rounded-2xl overflow-hidden border border-white/5 shadow-2xl h-[500px]">
                    {viewMode === "editor" ? (
                        <Editor
                            height="100%"
                            language={snippet.language}
                            theme={theme === "dark" || theme === "system" ? "vs-dark" : "light"}
                            value={snippet.code}
                            options={{
                                readOnly: true,
                                minimap: { enabled: true },
                                fontSize: 14,
                                padding: { top: 20 },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                fontFamily: "var(--font-mono)",
                            }}
                        />
                    ) : (
                        <CodePreview code={snippet.code} language={snippet.language} />
                    )}
                </div>

                {/* Section Commentaires & Sidebar */}
                <div className="grid gap-10 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-8">
                        <h2 className="text-2xl font-bold text-white border-l-4 border-purple-500 pl-4">Échanges Community</h2>

                        <form onSubmit={handleSubmitComment} className="space-y-4 glass-dark p-6 rounded-2xl border border-white/5">
                            <div className="space-y-2">
                                <Label htmlFor="comment" className="text-slate-300">Ajouter une réflexion</Label>
                                <Textarea
                                    id="comment"
                                    placeholder="Partage une astuce ou pose une question..."
                                    className="bg-slate-950/50 border-white/5 focus:border-purple-500/50 transition-all min-h-[100px] text-white"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                            </div>
                            <Button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl">
                                {isSubmitting ? <Icons.spinner className="h-4 w-4 animate-spin mr-2" /> : "Publier"}
                            </Button>
                        </form>

                        <div className="space-y-6">
                            {comments.length > 0 ? (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                        <div className="h-10 w-10 shrink-0 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-white/10 uppercase">
                                            {comment.userId.charAt(0)}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-white text-sm">Geek #{comment.userId.slice(0, 4)}</span>
                                                <span className="text-[10px] text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-slate-400 text-sm leading-relaxed">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-10 text-slate-500 italic">Soyez le premier à commenter !</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-xl font-bold text-white">Focus Auteur</h2>
                        <div className="glass-dark p-6 rounded-3xl border border-white/5 text-center bg-gradient-to-b from-purple-500/5 to-transparent">
                            <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 mb-4 items-center justify-center flex text-2xl font-bold text-white shadow-xl shadow-purple-500/20">
                                {snippet.userId ? snippet.userId.charAt(0).toUpperCase() : "G"}
                            </div>
                            <h3 className="font-bold text-lg text-white">Geek de Confiance</h3>
                            <p className="text-slate-400 text-sm mt-2 mb-6 leading-relaxed">Expert en architectures modernes et snippets élégants.</p>
                            <Button variant="outline" className="w-full rounded-xl hover:text-purple-400 bg-white/5 border-white/10 text-slate-300" asChild>
                                <Link href={`/profile`}>Bio complète</Link>
                            </Button>
                        </div>

                        <div className="glass-dark p-6 rounded-3xl border border-white/5">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Statistiques</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Moyenne</span>
                                    <span className="text-yellow-500 font-bold">{rating.average.toFixed(1)} / 5.0</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Votes</span>
                                    <span className="text-white font-bold">{rating.count}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Popularité</span>
                                    <span className="text-pink-500 font-bold">{(likes.count * 10 + rating.average * rating.count).toFixed(0)} pts</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
