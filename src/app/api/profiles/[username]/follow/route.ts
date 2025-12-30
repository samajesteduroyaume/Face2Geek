import { db } from "@/db"
import { follows, notifications } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<any> }
) {
    const session = await auth()
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    const { username } = await params

    try {
        const profileToFollow = await db.query.profiles.findFirst({
            where: (profiles, { eq }) => eq(profiles.username, username)
        })

        if (!profileToFollow) return new NextResponse("User not found", { status: 404 })
        if (profileToFollow.id === session.user.id) return new NextResponse("Self-follow not allowed", { status: 400 })

        const existingFollow = await db.query.follows.findFirst({
            where: and(
                eq(follows.followerId, session.user.id),
                eq(follows.followedId, profileToFollow.id)
            )
        })

        if (existingFollow) {
            await db.delete(follows).where(eq(follows.id, existingFollow.id))
            return NextResponse.json({ following: false })
        } else {
            await db.insert(follows).values({
                followerId: session.user.id,
                followedId: profileToFollow.id,
            })

            // Créer une notification pour l'utilisateur suivi
            await db.insert(notifications).values({
                userId: profileToFollow.id,
                type: "FOLLOW",
                actorId: session.user.id,
            })

            return NextResponse.json({ following: true })
        }
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<any> }
) {
    const { username } = await params
    const session = await auth()

    try {
        const targetProfile = await db.query.profiles.findFirst({
            where: (profiles, { eq }) => eq(profiles.username, username)
        })

        if (!targetProfile) return new NextResponse("User not found", { status: 404 })

        const followerCount = await db.query.follows.findMany({
            where: eq(follows.followedId, targetProfile.id)
        })

        const followingCount = await db.query.follows.findMany({
            where: eq(follows.followerId, targetProfile.id)
        })

        let isFollowing = false
        if (session?.user?.id) {
            const follow = await db.query.follows.findFirst({
                where: and(
                    eq(follows.followerId, session.user.id),
                    eq(follows.followedId, targetProfile.id)
                )
            })
            isFollowing = !!follow
        }

        return NextResponse.json({
            followerCount: followerCount.length,
            followingCount: followingCount.length,
            isFollowing
        })
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}
