import { db } from "@/db"
import { users, snippets, likes, ratings, profiles } from "@/db/schema"
import { eq, sql, desc } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        // Calcul du score de réputation : 
        // 1 point par Snippet
        // 5 points par Like reçu
        // (Moyenne des notes * 2) par Snippet noté
        // 10 points par vue totale / 100 (approximatif)

        const geeks = await db.select({
            id: users.id,
            name: users.name,
            username: profiles.username,
            image: users.image,
            snippetCount: sql<number>`count(distinct ${snippets.id})`,
            totalLikes: sql<number>`count(distinct ${likes.id})`,
            avgRating: sql<number>`avg(${ratings.score})`,
            totalViews: sql<number>`sum(${snippets.views})`,
        })
            .from(users)
            .leftJoin(profiles, eq(users.id, profiles.id))
            .leftJoin(snippets, eq(users.id, snippets.userId))
            .leftJoin(likes, eq(snippets.id, likes.snippetId))
            .leftJoin(ratings, eq(snippets.id, ratings.snippetId))
            .groupBy(users.id, profiles.username)
            .orderBy(desc(sql`count(distinct ${likes.id}) * 5 + count(distinct ${snippets.id}) + sum(${snippets.views}) / 10`))
            .limit(10)

        return NextResponse.json(geeks)
    } catch (error) {
        console.error(error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
