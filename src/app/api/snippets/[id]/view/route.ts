import { db } from "@/db"
import { snippets } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<any> }
) {
    const { id: snippetId } = await params

    try {
        await db.update(snippets)
            .set({
                views: sql`${snippets.views} + 1`
            })
            .where(eq(snippets.id, snippetId))

        return new NextResponse("OK", { status: 200 })
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}
