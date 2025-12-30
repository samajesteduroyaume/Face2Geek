import { db } from "@/db"
import { snippets } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { checkAndAwardBadges } from "@/lib/gamification"

export async function GET() {
    try {
        const allSnippets = await db.query.snippets.findMany({
            orderBy: [desc(snippets.createdAt)],
            with: {
                // En supposant qu'on veut aussi l'utilisateur plus tard si on ajoute la relation
            }
        })
        return NextResponse.json(allSnippets)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await auth()
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    try {
        const body = await request.json()
        const { title, code, language, tags } = body

        if (!title || !code || !language) {
            return new NextResponse("Missing fields", { status: 400 })
        }

        const newSnippet = await db.insert(snippets).values({
            title,
            code,
            language,
            tags,
            userId: session.user.id,
        }).returning()

        // Gamification: Vérifier les badges
        await checkAndAwardBadges(session.user.id)

        return NextResponse.json(newSnippet[0])
    } catch (error) {
        console.error(error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
