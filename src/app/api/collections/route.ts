import { db } from "@/db"
import { collections } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

export async function GET(request: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    try {
        const userCollections = await db.query.collections.findMany({
            where: eq(collections.userId, session.user.id),
            orderBy: [desc(collections.createdAt)],
        })
        return NextResponse.json(userCollections)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    try {
        const body = await request.json()
        const { name, isPublic } = body

        if (!name) {
            return new NextResponse("Missing name", { status: 400 })
        }

        const newCollection = await db.insert(collections).values({
            name,
            userId: session.user.id,
            isPublic: isPublic ?? true,
        }).returning()

        return NextResponse.json(newCollection[0])
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}
