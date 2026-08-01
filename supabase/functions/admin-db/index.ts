import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, fail, ok } from "../_shared/response.ts";

const ALLOWED_TABLES = new Set([
  "roles",
  "user_roles",
  "profiles",
  "invitations",
  "marketing_documents",
  "media_items",
  "blog_posts",
  "testimonials",
  "news_items",
  "career_postings",
  "email_templates",
  "email_sends",
  "system_settings",
  "chat_messages",
  "chat_typing_indicators",
]);

async function logAuditEvent(
  adminClient: ReturnType<typeof createClient>,
  params: { actorId: string; action: string; entity: string; entityId?: string; metadata?: Record<string, any> }
) {
  try {
    await adminClient.rpc("log_audit_event", {
      p_action: params.action,
      p_entity: params.entity,
      p_entity_id: params.entityId || null,
      p_metadata: {
        actor_id: params.actorId,
        source: "edge",
        ...params.metadata,
      },
    });
  } catch {
    // Best-effort audit log; do not block admin action on logging failure.
  }
}

async function getUserFromRequest(req: Request) {
  const auth = req.headers.get("Authorization");
  if (!auth) return null;

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anon) return null;

  const client = createClient(url, anon, {
    global: { headers: { Authorization: auth } },
  });

  const { data } = await client.auth.getUser();
  return data?.user || null;
}

async function isAdmin(userId: string): Promise<boolean> {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return false;

  const adminClient = createClient(url, serviceKey);
  const { data } = await adminClient.from("profiles").select("is_admin").eq("id", userId).maybeSingle();
  return !!data?.is_admin;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return fail("Method not allowed", 405, "BAD_REQUEST");
  }

  try {
    const caller = await getUserFromRequest(req);
    if (!caller) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const admin = await isAdmin(caller.id);
    if (!admin) return fail("Forbidden", 403, "FORBIDDEN");

    const body = await req.json().catch(() => null);
    const table = body?.table;
    const action = body?.action;
    const data = body?.data;
    const match = body?.match;
    const onConflict = body?.onConflict;

    if (!table || !ALLOWED_TABLES.has(table)) {
      return fail("Table not allowed", 400, "BAD_REQUEST");
    }

    if (!["insert", "update", "upsert", "delete"].includes(action)) {
      return fail("Invalid action", 400, "BAD_REQUEST");
    }

    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) return fail("Server not configured", 500, "SERVER_ERROR");

    const adminClient = createClient(url, serviceKey);

    let query = adminClient.from(table);

    if (action === "insert") {
      const { data: inserted, error } = await query.insert(data).select();
      if (error) return fail(error.message, 400, "BAD_REQUEST", { table, action });
      await logAuditEvent(adminClient, {
        actorId: caller.id,
        action: "admin_insert",
        entity: table,
        metadata: { count: Array.isArray(inserted) ? inserted.length : 1 },
      });
      return ok(inserted);
    }

    if (action === "upsert") {
      const { data: upserted, error } = await query
        .upsert(data, onConflict ? { onConflict } : undefined)
        .select();
      if (error) return fail(error.message, 400, "BAD_REQUEST", { table, action, onConflict });
      await logAuditEvent(adminClient, {
        actorId: caller.id,
        action: "admin_upsert",
        entity: table,
        metadata: { count: Array.isArray(upserted) ? upserted.length : 1, on_conflict: onConflict || null },
      });
      return ok(upserted);
    }

    if (!match || typeof match !== "object") {
      return fail("Missing match for update/delete", 400, "BAD_REQUEST");
    }

    Object.entries(match).forEach(([k, v]) => {
      query = query.eq(k, v);
    });

    if (action === "update") {
      const { data: updated, error } = await query.update(data).select();
      if (error) return fail(error.message, 400, "BAD_REQUEST", { table, action, match });
      await logAuditEvent(adminClient, {
        actorId: caller.id,
        action: "admin_update",
        entity: table,
        metadata: { count: Array.isArray(updated) ? updated.length : 1, match },
      });
      return ok(updated);
    }

    const { data: deleted, error } = await query.delete().select();
    if (error) return fail(error.message, 400, "BAD_REQUEST", { table, action, match });
    await logAuditEvent(adminClient, {
      actorId: caller.id,
      action: "admin_delete",
      entity: table,
      metadata: { count: Array.isArray(deleted) ? deleted.length : 1, match },
    });
    return ok(deleted);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unknown error", 500, "SERVER_ERROR");
  }
});
