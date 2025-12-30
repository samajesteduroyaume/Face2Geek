import { db } from "@/db"
import { snippets, follows } from "@/db/schema"
import { eq, inArray, desc } from "drizzle-orm"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    try {
        // 1. Récupérer les IDs des personnes suivies
        const following = await db.query.follows.findMany({
            where: eq(follows.followerId, session.user.id),
        })

        const followedIds = following.map(f => f.followedId)

        if (followedIds.length === 0) {
            return NextResponse.json([])
        }

        // 2. Récupérer les snippets de ces personnes
        const feed = await db.query.snippets.findMany({
            where: inArray(snippets.userId, followedIds),
            orderBy: [desc(snippets.createdAt)],
            limit: 20
        })

        return NextResponse.json(feed)
    } catch (error) {
        console.error(error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
