import { db } from "@/db"
import { ratings, notifications, snippets } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<any> }
) {
    const session = await auth()
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    const { id: snippetId } = await params

    try {
        const body = await request.json()
        const { score } = body

        if (!score || score < 1 || score > 5) {
            return new NextResponse("Invalid score", { status: 400 })
        }

        // Récupérer le snippet pour connaître le destinataire
        const snippet = await db.query.snippets.findFirst({
            where: (snippets, { eq }) => eq(snippets.id, snippetId)
        })

        if (!snippet) return new NextResponse("Snippet not found", { status: 404 })

        // Vérifier si déjà noté
        const existingRating = await db.query.ratings.findFirst({
            where: and(
                eq(ratings.userId, session.user.id),
                eq(ratings.snippetId, snippetId)
            )
        })

        let result;
        if (existingRating) {
            // Mise à jour de la note
            const updatedRating = await db.update(ratings)
                .set({ score })
                .where(eq(ratings.id, existingRating.id))
                .returning()
            result = updatedRating[0]
        } else {
            // Nouvelle note
            const newRating = await db.insert(ratings).values({
                userId: session.user.id,
                snippetId,
                score,
            }).returning()
            result = newRating[0]

            // Notification seulement pour une NOUVELLE note (éviter spam lors du changement de score)
            if (snippet.userId && snippet.userId !== session.user.id) {
                await db.insert(notifications).values({
                    userId: snippet.userId,
                    type: "RATE",
                    actorId: session.user.id,
                    snippetId: snippetId,
                })
            }
        }
        return NextResponse.json(result)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<any> }
) {
    const { id: snippetId } = await params

    try {
        const allRatings = await db.query.ratings.findMany({
            where: eq(ratings.snippetId, snippetId)
        })

        const average = allRatings.length > 0
            ? allRatings.reduce((acc, curr) => acc + curr.score, 0) / allRatings.length
            : 0

        return NextResponse.json({
            average,
            count: allRatings.length
        })
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}
