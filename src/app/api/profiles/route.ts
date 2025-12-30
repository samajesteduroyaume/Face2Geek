import { db } from "@/db"
import { profiles } from "@/db/schema"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const allProfiles = await db.query.profiles.findMany({
            limit: 20,
            columns: {
                id: true,
                full_name: true,
                username: true,
                bio: true,
            }
        })
        return NextResponse.json(allProfiles)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}
