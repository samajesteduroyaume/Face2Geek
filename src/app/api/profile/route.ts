import { db } from "@/db"
import { users, profiles, badges, userBadges, snippets, likes, follows } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    try {
        // Fetch profile with badges
        const profile = await db.query.profiles.findFirst({
            where: eq(profiles.id, session.user.id),
        })

        const userBadgesList = await db.select({
            id: badges.id,
            name: badges.name,
            description: badges.description,
            icon: badges.icon,
        })
            .from(userBadges)
            .innerJoin(badges, eq(userBadges.badgeId, badges.id))
            .where(eq(userBadges.userId, session.user.id))

        // Stats pour le profil
        const stats = await db.select({
            snippetsCount: sql<number>`count(distinct ${snippets.id})`,
            likesReceived: sql<number>`count(distinct ${likes.id})`,
        })
            .from(snippets)
            .leftJoin(likes, eq(snippets.id, likes.snippetId))
            .where(eq(snippets.userId, session.user.id))

        return NextResponse.json({
            ...profile,
            badges: userBadgesList,
            stats: stats[0]
        })
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}
