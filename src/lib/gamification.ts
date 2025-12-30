import { db } from "@/db"
import { badges, userBadges, snippets, likes, comments } from "@/db/schema"
import { eq, sql, and } from "drizzle-orm"

export async function checkAndAwardBadges(userId: string) {
    try {
        // 1. Récupérer tous les badges existants
        const allBadges = await db.select().from(badges)

        // 2. Récupérer les badges déjà possédés par l'utilisateur
        const ownedBadges = await db.select({ badgeId: userBadges.badgeId })
            .from(userBadges)
            .where(eq(userBadges.userId, userId))

        const ownedBadgeIds = new Set(ownedBadges.map(b => b.badgeId))

        // 3. Calculer les métriques de l'utilisateur
        const metrics = {
            snippetCount: (await db.select({ count: sql`count(*)` }).from(snippets).where(eq(snippets.userId, userId)))[0].count as number,
            likeCount: (await db.select({ count: sql`count(*)` }).from(likes).innerJoin(snippets, eq(likes.snippetId, snippets.id)).where(eq(snippets.userId, userId)))[0].count as number,
            commentCount: (await db.select({ count: sql`count(*)` }).from(comments).where(eq(comments.userId, userId)))[0].count as number,
        }

        // 4. Vérifier chaque badge non possédé
        for (const badge of allBadges) {
            if (ownedBadgeIds.has(badge.id)) continue

            let shouldAward = false
            if (badge.criteria === "SNIPPET_COUNT" && metrics.snippetCount >= badge.threshold) {
                shouldAward = true
            } else if (badge.criteria === "LIKE_COUNT" && metrics.likeCount >= badge.threshold) {
                shouldAward = true
            } else if (badge.criteria === "COMMENT_COUNT" && metrics.commentCount >= badge.threshold) {
                shouldAward = true
            }

            if (shouldAward) {
                await db.insert(userBadges).values({
                    userId,
                    badgeId: badge.id
                }).onConflictDoNothing()

                // Ici on pourrait aussi déclencher une notification spécifique "Nouveau Badge !"
            }
        }
    } catch (error) {
        console.error("Error checking badges:", error)
    }
}
