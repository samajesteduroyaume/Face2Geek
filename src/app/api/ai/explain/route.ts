import { NextRequest, NextResponse } from "next/server"
import { simulateAIAnalysis } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
    try {
        const { code, language } = await request.json()
        if (!code) return new NextResponse("Code is required", { status: 400 })

        const analysis = await simulateAIAnalysis(code, language || "javascript")
        return NextResponse.json(analysis)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}
