import { db } from "@/db"
import { notifications } from "@/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

export async function GET(request: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    try {
        const userNotifications = await db.query.notifications.findMany({
            where: eq(notifications.userId, session.user.id),
            orderBy: [desc(notifications.createdAt)],
            limit: 50,
        })
        return NextResponse.json(userNotifications)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    try {
        const body = await request.json()
        const { id, all } = body

        if (all) {
            await db.update(notifications)
                .set({ isRead: true })
                .where(eq(notifications.userId, session.user.id))
        } else if (id) {
            await db.update(notifications)
                .set({ isRead: true })
                .where(and(
                    eq(notifications.id, id),
                    eq(notifications.userId, session.user.id)
                ))
        }

        return new NextResponse("OK", { status: 200 })
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}
