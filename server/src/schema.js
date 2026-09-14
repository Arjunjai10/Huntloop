"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companies = exports.workspaces = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.workspaces = (0, pg_core_1.pgTable)('workspaces', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.companies = (0, pg_core_1.pgTable)('companies', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    workspaceId: (0, pg_core_1.uuid)('workspace_id').references(() => exports.workspaces.id).notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    domain: (0, pg_core_1.text)('domain'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// Note: Postgres Row Level Security (RLS) policies will be enforced via custom migrations
//# sourceMappingURL=schema.js.map