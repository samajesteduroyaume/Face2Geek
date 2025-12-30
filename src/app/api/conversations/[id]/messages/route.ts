import { db } from "@/db"
import { messages, notifications } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET(
    request: Request,
    { params }: { params: Promise<any> }
) {
    const session = await auth()
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    const { id: conversationId } = await params

    try {
        const convMessages = await db.select().from(messages)
            .where(eq(messages.conversationId, conversationId))
            .orderBy(asc(messages.createdAt))

        return NextResponse.json(convMessages)
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

    const { id: conversationId } = await params

    try {
        const { content, recipientId } = await request.json()
        if (!content) return new NextResponse("Missing content", { status: 400 })

        const newMessage = await db.insert(messages).values({
            conversationId,
            senderId: session.user.id,
            content,
        }).returning()

        // Notification de message
        if (recipientId) {
            await db.insert(notifications).values({
                userId: recipientId,
                type: "MESSAGE",
                actorId: session.user.id,
            })
        }

        return NextResponse.json(newMessage[0])
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}
