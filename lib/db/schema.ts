
import { relations } from "drizzle-orm";
import { pgTable, uuid, integer, boolean, text, timestamp, varchar } from "drizzle-orm/pg-core";


export const files = pgTable("files", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name").notNull(),
    path: varchar("path").notNull(),
    size: integer("size").notNull(),
    type: varchar("type").notNull(),

    fileUrl: text("file_url").notNull(),
    thumbnailUrl: text("thumbnail_url"),

    userId: text("user_id").notNull(),
    parentId: text("parent_id"),

    isFolder: boolean("is_folder").default(false).notNull(),
    isStarred: boolean("is_starred").default(false).notNull(),
    isTrash: boolean("is_trash").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})


export const fileRelations = relations(files, ({ one, many }) => ({

    parent: one(files, {
        fields: [files.parentId],
        references: [files.id]
    }),

    children: many(files)
}))


export const File = typeof files.$inferSelect;
export const NewFile = typeof files.$inferInsert;