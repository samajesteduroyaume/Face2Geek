import { db } from "@/db"
import { comments, notifications, snippets } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { checkAndAwardBadges } from "@/lib/gamification"

export async function GET(
    request: Request,
    { params }: { params: Promise<any> }
) {
    const { id: snippetId } = await params

    try {
        const snippetComments = await db.query.comments.findMany({
            where: eq(comments.snippetId, snippetId),
            orderBy: [desc(comments.createdAt)],
            with: {
                // user: true // Si on veut les infos user plus tard
            }
        })
        return NextResponse.json(snippetComments)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<any> }
) {
    const session = await auth()
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    const { id: snippetId } = await params

    try {
        const body = await request.json()
        const { content } = body

        if (!content) {
            return new NextResponse("Le commentaire ne peut pas être vide", { status: 400 })
        }

        const newComment = await db.insert(comments).values({
            content,
            userId: session.user.id,
            snippetId: snippetId,
        }).returning()

        // Notification
        const snippet = await db.query.snippets.findFirst({
            where: (snippets, { eq }) => eq(snippets.id, snippetId)
        })

        if (snippet?.userId && snippet.userId !== session.user.id) {
            await db.insert(notifications).values({
                userId: snippet.userId,
                type: "COMMENT",
                actorId: session.user.id,
                snippetId: snippetId,
            })
        }

        // Gamification: Vérifier les badges du créateur et de l'acteur
        if (snippet?.userId) {
            await checkAndAwardBadges(snippet.userId);
        }
        await checkAndAwardBadges(session.user.id);

        return NextResponse.json(newComment[0])
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}
