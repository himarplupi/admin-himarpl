import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
  pgEnum,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";
import { createId } from "@/lib/cuid2";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `himarpl_${name}`);

export const socialMedia = createTable("social_media", {
  id: varchar("id", { length: 36 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar("userId", { length: 36 })
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).notNull(),
});

export const socialMediaRelations = relations(socialMedia, ({ one }) => ({
  user: one(users, { fields: [socialMedia.userId], references: [users.id] }),
}));

export const postCategories = createTable(
  "post_category",
  {
    id: varchar("id", { length: 36 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    title: varchar("title", { length: 255 }).notNull(),
    metaTitle: varchar("metaTitle", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    content: text("content"),
    createdAt: timestamp("createdAt", { mode: "date" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (postCategory) => ({
    titleIndex: index("post_category_title_idx").on(postCategory.title),
  }),
);

export const postCategoryRelations = relations(postCategories, ({ many }) => ({
  posts: many(posts),
}));

export const postTags = createTable(
  "post_tag",
  {
    id: varchar("id", { length: 36 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    title: varchar("title", { length: 255 }).notNull(),
    metaTitle: varchar("metaTitle", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    content: text("content"),
    createdAt: timestamp("createdAt", { mode: "date" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (postTag) => ({
    titleIndex: index("post_tag_title_idx").on(postTag.title),
  }),
);

export const postTagRelations = relations(postTags, ({ many }) => ({
  posts: many(posts),
}));

export const posts = createTable(
  "post",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => createId()),
    authorId: varchar("authorId", { length: 36 })
      .notNull()
      .references(() => users.id),
    title: varchar("title", { length: 255 }).notNull(),
    metaTitle: varchar("metaTitle", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    publishedAt: timestamp("publishedAt", { mode: "date" }),
  },
  (example) => ({
    authorIdIdx: index("post_authorId_idx").on(example.authorId),
    titleIndex: index("post_title_idx").on(example.title),
  }),
);

export const postRelations = relations(posts, ({ one, many }) => ({
  user: one(users, { fields: [posts.authorId], references: [users.id] }),
  categories: many(postCategories),
  tags: many(postTags),
}));

export const departmentTypeEnum = pgEnum("type", ["BE", "DP"]);

export const departments = createTable("department", {
  id: varchar("id", { length: 36 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: departmentTypeEnum("type").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const departmentRelations = relations(departments, ({ many }) => ({
  users: many(users),
}));

export const roleEnum = pgEnum("role", ["admin", "member"]);

export const users = createTable(
  "user",
  {
    id: varchar("id", { length: 36 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: timestamp("emailVerified", {
      mode: "date",
    }).default(sql`CURRENT_TIMESTAMP`),
    image: varchar("image", { length: 255 }),
    username: varchar("username", { length: 16 }),
    bio: text("bio"),
    role: roleEnum("role").notNull().default("member"),
    lastLoginAt: timestamp("lastLoginAt", { mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    createdAt: timestamp("createdAt", { mode: "date" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    departmentId: varchar("departmentId", { length: 255 }).references(
      () => departments.id,
    ),
  },
  (user) => ({
    departmentIdIdx: index("user_departmentId_idx").on(user.departmentId),
  }),
);

export const usersRelations = relations(users, ({ one, many }) => ({
  accounts: many(accounts),
  posts: many(posts),
  socialMedia: many(socialMedia),
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("userId", { length: 36 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 36 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export type Department = typeof departments.$inferSelect;
export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type PostCategory = typeof postCategories.$inferSelect;
export type PostTag = typeof postTags.$inferSelect;
export type SocialMedia = typeof socialMedia.$inferSelect;
