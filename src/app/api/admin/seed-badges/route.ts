import { db } from "@/db"
import { badges } from "@/db/schema"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    console.log("Seed badges request received");
    const defaultBadges = [
        { name: "Pionnier", description: "Publier son premier snippet", icon: "code", criteria: "SNIPPET_COUNT", threshold: 1 },
        { name: "Star du Code", description: "Recevoir 10 likes au total", icon: "heart", criteria: "LIKE_COUNT", threshold: 10 },
        { name: "Critique Émérite", description: "Laisser 5 commentaires", icon: "message-square", criteria: "COMMENT_COUNT", threshold: 5 },
        { name: "Expert Reconnu", description: "Avoir 3 snippets avec une moyenne > 4.5", icon: "star", criteria: "TOP_RATED", threshold: 3 },
    ]

    try {
        for (const badge of defaultBadges) {
            await db.insert(badges).values(badge).onConflictDoNothing()
        }
    } catch (error: any) {
        console.error("Seed error:", error)
        return NextResponse.json({
            error: "Erreur lors de l'initialisation",
            details: error.message || error
        }, { status: 500 })
    }
}
