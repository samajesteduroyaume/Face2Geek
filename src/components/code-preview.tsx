"use client"

import { useEffect, useRef, useState } from "react"
import { Icons } from "@/components/icons"

interface CodePreviewProps {
    code: string
    language: string
}

export function CodePreview({ code, language }: CodePreviewProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [isExecuting, setIsExecuting] = useState(false)

    const supportedLanguages = ["html", "javascript", "css", "typescript"]
    const isSupported = supportedLanguages.includes(language.toLowerCase())

    useEffect(() => {
        if (!isSupported || !iframeRef.current) return

        const updatePreview = () => {
            setIsExecuting(true)
            const iframe = iframeRef.current!
            const doc = iframe.contentDocument || iframe.contentWindow?.document
            if (!doc) return

            let content = ""
            if (language.toLowerCase() === "html") {
                content = code
            } else if (language.toLowerCase() === "javascript" || language.toLowerCase() === "typescript") {
                content = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <style>
                            body { font-family: sans-serif; color: white; background: #0f172a; padding: 20px; }
                        </style>
                    </head>
                    <body>
                        <div id="root"></div>
                        <script>
                            try {
                                console.log = (...args) => {
                                    const div = document.createElement('div');
                                    div.style.color = '#94a3b8';
                                    div.style.fontSize = '12px';
                                    div.style.marginBottom = '4px';
                                    div.textContent = '> ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
                                    document.body.appendChild(div);
                                };
                                ${code}
                            } catch (err) {
                                document.body.innerHTML = '<pre style="color: #ef4444;">' + err.message + '</pre>';
                            }
                        </script>
                    </body>
                    </html>
                `
            } else if (language.toLowerCase() === "css") {
                content = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>${code}</style>
                    </head>
                    <body>
                        <div style="padding: 20px; color: white;">
                            <h1>Preview CSS</h1>
                            <p>Testez vos styles ici.</p>
                            <button style="padding: 10px 20px; border-radius: 8px;">Style Me</button>
                        </div>
                    </body>
                    </html>
                `
            }

            doc.open()
            doc.write(content)
            doc.close()
            setIsExecuting(false)
        }

        const timeout = setTimeout(updatePreview, 500)
        return () => clearTimeout(timeout)
    }, [code, language, isSupported])

    if (!isSupported) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-slate-950/50 rounded-xl border border-dashed border-white/10 p-10 text-center">
                <Icons.code className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm italic">L'exécution en direct n'est pas encore supportée pour {language}.</p>
                <p className="text-[10px] mt-2 text-slate-600">Supporté : HTML, JavaScript, CSS, TypeScript</p>
            </div>
        )
    }

    return (
        <div className="relative h-full w-full bg-slate-900 rounded-xl overflow-hidden border border-white/5 shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-8 bg-slate-800/80 border-b border-white/5 flex items-center px-4 justify-between z-10">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                </div>
                <div className="flex items-center gap-2">
                    {isExecuting && <Icons.spinner className="h-3 w-3 animate-spin text-purple-500" />}
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Live Execution</span>
                </div>
            </div>
            <iframe
                ref={iframeRef}
                className="w-full h-full pt-8 border-none bg-[#0f172a]"
                title="Code Preview"
                sandbox="allow-scripts"
            />
        </div>
    )
}
