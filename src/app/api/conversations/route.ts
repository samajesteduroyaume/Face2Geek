import { db } from "@/db"
import { conversations, conversationParticipants, profiles, users } from "@/db/schema"
import { eq, and, sql } from "drizzle-orm"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

// GET: Lister les conversations de l'utilisateur
export async function GET() {
    const session = await auth()
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    try {
        const userConversations = await db.select({
            id: conversations.id,
            createdAt: conversations.createdAt,
            participant: {
                id: users.id,
                name: users.name,
                image: users.image,
                username: profiles.username,
            }
        })
            .from(conversations)
            .innerJoin(conversationParticipants, eq(conversations.id, conversationParticipants.conversationId))
            .innerJoin(users, eq(users.id, conversationParticipants.userId))
            .leftJoin(profiles, eq(users.id, profiles.id))
            .where(
                and(
                    sql`${conversations.id} IN (
                    SELECT conversation_id FROM conversation_participants WHERE user_id = ${session.user.id}
                )`,
                    sql`${conversationParticipants.userId} != ${session.user.id}`
                )
            )

        return NextResponse.json(userConversations)
    } catch (error) {
        console.error(error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

// POST: Créer ou trouver une conversation avec un autre utilisateur
export async function POST(request: Request) {
    const session = await auth()
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    try {
        const { recipientId } = await request.json()
        if (!recipientId) return new NextResponse("Missing recipientId", { status: 400 })

        // 1. Chercher si une conversation existe déjà entre les deux
        const existing = await db.execute(sql`
            SELECT cp1.conversation_id 
            FROM conversation_participants cp1
            JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
            WHERE cp1.user_id = ${session.user.id} AND cp2.user_id = ${recipientId}
            LIMIT 1
        `)

        if (existing.rows.length > 0) {
            return NextResponse.json({ id: existing.rows[0].conversation_id })
        }

        // 2. Créer une nouvelle conversation
        const newConv = await db.insert(conversations).values({}).returning()
        const convId = newConv[0].id

        await db.insert(conversationParticipants).values([
            { conversationId: convId, userId: session.user.id },
            { conversationId: convId, userId: recipientId },
        ])

        return NextResponse.json({ id: convId })
    } catch (error) {
        console.error(error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
