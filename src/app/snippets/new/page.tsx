"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Editor from "@monaco-editor/react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

const LANGUAGES = [
    "javascript", "typescript", "python", "java", "cpp", "csharp", "go", "rust", "php", "sql", "html", "css"
]

export default function NewSnippetPage() {
    const router = useRouter()
    const { theme } = useTheme()
    const [isLoading, setIsLoading] = useState(false)
    const [title, setTitle] = useState("")
    const [language, setLanguage] = useState("javascript")
    const [code, setCode] = useState("// Tape ton code ici...")
    const [tags, setTags] = useState("")
    const [isTagging, setIsTagging] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !code) return

        setIsLoading(true)
        try {
            // Transformer la chaîne de tags "tag1, tag2" en ["tag1", "tag2"]
            const tagsArray = tags.split(",").map(t => t.trim()).filter(t => t !== "")

            const response = await fetch("/api/snippets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    language,
                    code,
                    tags: tagsArray
                }),
            })

            if (!response.ok) throw new Error("Erreur lors de la sauvegarde")

            toast.success("Snippet créé avec succès 🚀")
            router.push("/dashboard")
            router.refresh()
        } catch (error) {
            toast.error("Erreur lors de la création du snippet")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container py-10 selection:bg-purple-500/30">
            <div className="flex flex-col space-y-8 max-w-5xl mx-auto">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Nouveau Snippet</h1>
                    <p className="text-slate-400 mt-2">Partage ton génie avec la communauté Face2Geek.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="title" className="text-slate-300">Titre de l'œuvre</Label>
                            <Input
                                id="title"
                                placeholder="Ex: Hook React surpuissant"
                                className="bg-white/5 border-white/10 focus:border-purple-500/50 h-12 rounded-xl"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="language" className="text-slate-300">Langage</Label>
                            <select
                                id="language"
                                className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-purple-500/50 text-white"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                            >
                                {LANGUAGES.map((lang) => (
                                    <option key={lang} value={lang} className="bg-[#020617] text-white">
                                        {lang.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="tags" className="text-slate-300">Tags (séparés par des virgules)</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={isTagging || !code}
                                onClick={async () => {
                                    setIsTagging(true)
                                    try {
                                        const res = await fetch("/api/ai/explain", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ code, language })
                                        })
                                        if (res.ok) {
                                            const data = await res.json()
                                            setTags(data.suggestedTags.join(", "))
                                            toast.success("Tags suggérés appliqués !")
                                        }
                                    } catch (error) {
                                        toast.error("Erreur d'auto-tagging")
                                    } finally {
                                        setIsTagging(false)
                                    }
                                }}
                                className="h-6 text-[10px] text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                            >
                                {isTagging ? <Icons.spinner className="mr-1 h-3 w-3 animate-spin" /> : <Icons.add className="mr-1 h-3 w-3" />}
                                Suggérer des tags par l'IA
                            </Button>
                        </div>
                        <Input
                            id="tags"
                            placeholder="ex: react, auth, performance"
                            className="bg-white/5 border-white/10 focus:border-purple-500/50 h-12 rounded-xl"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                        <p className="text-[10px] text-slate-500 italic">Ces tags aideront les autres geeks à trouver ton code.</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-300">Code Source</Label>
                        <div className="h-[500px] overflow-hidden rounded-2xl border border-white/10 shadow-lg">
                            <Editor
                                height="100%"
                                language={language}
                                theme={theme === "dark" ? "vs-dark" : "light"}
                                value={code}
                                onChange={(val) => setCode(val ?? "")}
                                options={{
                                    minimap: { enabled: true },
                                    fontSize: 14,
                                    padding: { top: 20 },
                                    fontFamily: "var(--font-mono)",
                                    automaticLayout: true,
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <Button variant="ghost" onClick={() => router.back()} type="button" className="text-slate-500 hover:text-white">
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 rounded-xl px-8 h-12 font-bold shadow-lg shadow-purple-500/20">
                            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                            Publier le Snippet
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
