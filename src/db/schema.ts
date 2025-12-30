import {
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
    integer,
    boolean,
    pgEnum,
} from "drizzle-orm/pg-core"

export const notificationTypeEnum = pgEnum("notification_type", ["LIKE", "COMMENT", "FOLLOW", "RATE", "MESSAGE"])

export const users = pgTable("user", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name"),
    email: text("email").notNull().unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
})

export const profiles = pgTable("profiles", {
    id: uuid("id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
    full_name: varchar("full_name", { length: 255 }),
    username: varchar("username", { length: 255 }).unique(),
    bio: text("bio"),
    github_url: text("github_url"),
    website_url: text("website_url"),
    twitter_url: text("twitter_url"),
    updated_at: timestamp("updated_at").defaultNow(),
})

export const follows = pgTable("follows", {
    id: uuid("id").defaultRandom().primaryKey(),
    followerId: uuid("followerId").notNull().references(() => users.id, { onDelete: "cascade" }),
    followedId: uuid("followedId").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
})

export const collections = pgTable("collections", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    isPublic: boolean("isPublic").default(true),
    createdAt: timestamp("created_at").defaultNow(),
})

export const snippets = pgTable("snippets", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    code: text("code").notNull(),
    language: varchar("language", { length: 50 }).notNull(),
    userId: uuid("userId").references(() => users.id, { onDelete: "cascade" }),
    collectionId: uuid("collectionId").references(() => collections.id, { onDelete: "set null" }),
    tags: text("tags").array(),
    views: integer("views").default(0),
    createdAt: timestamp("created_at").defaultNow(),
})

export const comments = pgTable("comments", {
    id: uuid("id").defaultRandom().primaryKey(),
    content: text("content").notNull(),
    userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    snippetId: uuid("snippetId").notNull().references(() => snippets.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
})

export const likes = pgTable("likes", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    snippetId: uuid("snippetId").notNull().references(() => snippets.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
})

export const ratings = pgTable("ratings", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    snippetId: uuid("snippetId").notNull().references(() => snippets.id, { onDelete: "cascade" }),
    score: integer("score").notNull(), // 1-5
    createdAt: timestamp("created_at").defaultNow(),
})

export const notifications = pgTable("notifications", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }), // Destinataire
    type: text("type").notNull(), // LIKE, COMMENT, FOLLOW, RATE, MESSAGE
    actorId: uuid("actorId").notNull().references(() => users.id, { onDelete: "cascade" }), // Celui qui fait l'action
    snippetId: uuid("snippetId").references(() => snippets.id, { onDelete: "cascade" }),
    isRead: boolean("isRead").default(false),
    createdAt: timestamp("created_at").defaultNow(),
})

export const badges = pgTable("badges", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
    icon: varchar("icon", { length: 50 }).notNull(),
    criteria: text("criteria").notNull(),
    threshold: integer("threshold").notNull(),
})

export const userBadges = pgTable("user_badges", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    badgeId: uuid("badgeId").notNull().references(() => badges.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
})

export const conversations = pgTable("conversations", {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at").defaultNow(),
})

export const conversationParticipants = pgTable("conversation_participants", {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversationId").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
})

export const messages = pgTable("messages", {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversationId").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("senderId").notNull().references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    isRead: boolean("isRead").default(false),
})
