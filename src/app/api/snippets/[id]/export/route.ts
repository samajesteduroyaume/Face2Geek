import { auth } from "@/auth"
import { db } from "@/db"
import { snippets } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<any> }
) {
    const session = await auth()
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    const { id: snippetId } = await params

    try {
        const snippet = await db.query.snippets.findFirst({
            where: eq(snippets.id, snippetId)
        })

        if (!snippet) return new NextResponse("Snippet not found", { status: 404 })

        // Simulation d'export Gist GitHub
        // Dans une vraie app, on utiliserait octokit avec le token de l'utilisateur
        await new Promise(resolve => setTimeout(resolve, 1500));

        const gistUrl = `https://gist.github.com/face2geek-demo/${snippetId}`;

        return NextResponse.json({
            message: "Snippet exporté vers GitHub Gist ✅",
            url: gistUrl
        })
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}
