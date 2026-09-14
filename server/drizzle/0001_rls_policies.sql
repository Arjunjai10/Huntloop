-- 0001_rls_policies.sql
ALTER TABLE "workspaces" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspaces" FORCE ROW LEVEL SECURITY;

ALTER TABLE "companies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "companies" FORCE ROW LEVEL SECURITY;

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;

-- Policies for workspaces
CREATE POLICY "workspaces_isolation" ON "workspaces"
AS PERMISSIVE FOR ALL
TO public
USING (id = current_setting('app.current_workspace_id', TRUE)::uuid)
WITH CHECK (id = current_setting('app.current_workspace_id', TRUE)::uuid);

-- Policies for companies
CREATE POLICY "companies_isolation" ON "companies"
AS PERMISSIVE FOR ALL
TO public
USING (workspace_id = current_setting('app.current_workspace_id', TRUE)::uuid)
WITH CHECK (workspace_id = current_setting('app.current_workspace_id', TRUE)::uuid);

-- Policies for users
CREATE POLICY "users_isolation" ON "users"
AS PERMISSIVE FOR ALL
TO public
USING (workspace_id = current_setting('app.current_workspace_id', TRUE)::uuid)
WITH CHECK (workspace_id = current_setting('app.current_workspace_id', TRUE)::uuid);
