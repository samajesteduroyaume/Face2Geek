import { db } from "@/db"
import { likes, notifications, snippets } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { checkAndAwardBadges } from "@/lib/gamification"

export async function POST(
    request: Request,
    { params }: { params: Promise<any> }
) {
    const session = await auth()
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    const { id: snippetId } = await params

    try {
        // Récupérer le snippet pour connaître le destinataire de la notification
        const snippet = await db.query.snippets.findFirst({
            where: (snippets, { eq }) => eq(snippets.id, snippetId)
        })

        if (!snippet) return new NextResponse("Snippet not found", { status: 404 })

        // Vérifier si le like existe déjà
        const existingLike = await db.query.likes.findFirst({
            where: and(
                eq(likes.userId, session.user.id),
                eq(likes.snippetId, snippetId)
            )
        })

        if (existingLike) {
            // Unlike
            await db.delete(likes).where(eq(likes.id, existingLike.id))
            return NextResponse.json({ liked: false })
        } else {
            // Like
            await db.insert(likes).values({
                userId: session.user.id,
                snippetId: snippetId,
            })

            // Créer une notification si ce n'est pas son propre snippet
            if (snippet.userId && snippet.userId !== session.user.id) {
                await db.insert(notifications).values({
                    userId: snippet.userId,
                    type: "LIKE",
                    actorId: session.user.id,
                    snippetId: snippetId,
                })
            }

            // Gamification: Vérifier les badges du créateur et de l'acteur
            if (snippet.userId) {
                await checkAndAwardBadges(snippet.userId);
            }
            await checkAndAwardBadges(session.user.id);

            return NextResponse.json({ liked: true })
        }
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: snippetId } = await params

    try {
        const allLikes = await db.select().from(likes).where(eq(likes.snippetId, snippetId))

        // Si l'utilisateur est connecté, vérifier s'il a liké
        const session = await auth()
        const userId = session?.user?.id
        const userLiked = userId
            ? allLikes.some(l => l.userId === userId)
            : false

        return NextResponse.json({
            count: allLikes.length,
            userLiked
        })
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}
