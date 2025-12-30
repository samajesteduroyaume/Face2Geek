"use client"

import { useState } from "react"
import Editor from "@monaco-editor/react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Label } from "@/components/ui/label"
import { CodePreview } from "@/components/code-preview"

export default function PlaygroundPage() {
    const { theme } = useTheme()
    const [code, setCode] = useState("<h1>Hello Face2Geek!</h1>\n<p>Écris du code ici et vois le résultat en direct.</p>\n<style>\n  body { color: white; background: transparent; font-family: sans-serif; }\n  h1 { color: #a855f7; }\n</style>")
    const [language, setLanguage] = useState("html")

    const languages = [
        { id: "html", label: "HTML", icon: "code" },
        { id: "javascript", label: "JavaScript", icon: "code" },
        { id: "css", label: "CSS", icon: "code" },
    ]

    return (
        <div className="min-h-screen bg-[#020617] py-10 selection:bg-purple-500/30">
            <div className="container px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-8 h-[calc(100vh-120px)]">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">Playground 2.0</h1>
                        <p className="text-slate-400 mt-1">L'atelier créatif où ton code prend vie.</p>
                    </div>
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        {languages.map((lang) => (
                            <button
                                key={lang.id}
                                onClick={() => setLanguage(lang.id)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${language === lang.id ? "bg-purple-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="grid flex-1 gap-6 lg:grid-cols-2 overflow-hidden">
                    <div className="flex flex-col gap-4 overflow-hidden">
                        <div className="flex items-center justify-between px-2">
                            <Label className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">Éditeur {language.toUpperCase()}</Label>
                            <span className="text-[10px] text-slate-500 italic">Auto-refresh actif</span>
                        </div>
                        <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 glass-dark shadow-2xl">
                            <Editor
                                height="100%"
                                language={language}
                                theme={theme === "dark" || theme === "system" ? "vs-dark" : "light"}
                                value={code}
                                onChange={(val) => setCode(val ?? "")}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    padding: { top: 20 },
                                    automaticLayout: true,
                                    fontFamily: "var(--font-mono)",
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 overflow-hidden">
                        <div className="flex items-center justify-between px-2">
                            <Label className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">Rendu en direct</Label>
                            <div className="flex gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            </div>
                        </div>
                        <div className="flex-1 rounded-2xl overflow-hidden glass-dark border border-white/10 shadow-2xl relative">
                            <CodePreview code={code} language={language} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
