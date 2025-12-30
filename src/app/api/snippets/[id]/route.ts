import { db } from "@/db"
import { snippets } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<any> }
) {
    try {
        const { id } = await params
        const snippet = await db.query.snippets.findFirst({
            where: eq(snippets.id, id),
        })

        if (!snippet) {
            return new NextResponse("Snippet non trouvé", { status: 404 })
        }

        return NextResponse.json(snippet)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}
