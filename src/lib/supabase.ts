import { createClient, type User, type Session } from '@supabase/supabase-js';
import { isSuperadminEmail, SUPERADMIN_EMAILS } from './adminAccess';
import { buildMockQuestionnaireRow } from './mock/mockQuestionnaireSeed';

type MockQueryResult = {
  data: any;
  error: null | { message: string };
  count: null;
  status: number;
  statusText: string;
};

const MOCK_AUTH_KEY = 'bmcore.mock.auth.v1';
const MOCK_QUESTIONNAIRE_PREFIX = 'bmcore.mock.questionnaire.';
const MOCK_HEALTH_REPORTS_KEY = 'bmcore.mock.health_reports.v1';
const MOCK_MEDICAL_FILES_KEY = 'bmcore.mock.medical_files.v1';
const MOCK_USER_DEVICES_KEY = 'bmcore.mock.user_devices.v1';
const MOCK_REPORT_SETTINGS_KEY = 'bmcore.mock.report_settings.v1';
const MOCK_SHAREABLE_REPORTS_KEY = 'bmcore.mock.shareable_reports.v1';
const SUPERADMIN_ID = '00000000-0000-4000-8000-000000000001';

type MockAuthState = {
  user: User;
  access_token: string;
};

type AuthListener = (event: string, session: Session | null) => void;
const authListeners = new Set<AuthListener>();

function emptyResult(data: any = null): MockQueryResult {
  return { data, error: null, count: null, status: 200, statusText: 'OK' };
}

function readMockAuth(): MockAuthState | null {
  try {
    const raw = localStorage.getItem(MOCK_AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MockAuthState;
  } catch {
    return null;
  }
}

function writeMockAuth(state: MockAuthState | null) {
  try {
    if (!state) localStorage.removeItem(MOCK_AUTH_KEY);
    else localStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function readMockJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeMockJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function readMockQuestionnaire(userId: string): Record<string, unknown> | null {
  return readMockJson<Record<string, unknown> | null>(`${MOCK_QUESTIONNAIRE_PREFIX}${userId}`, null);
}

function writeMockQuestionnaire(userId: string, row: Record<string, unknown>) {
  writeMockJson(`${MOCK_QUESTIONNAIRE_PREFIX}${userId}`, row);
}

function readMockHealthReports(): Array<Record<string, unknown>> {
  return readMockJson<Array<Record<string, unknown>>>(MOCK_HEALTH_REPORTS_KEY, []);
}

function writeMockHealthReports(rows: Array<Record<string, unknown>>) {
  writeMockJson(MOCK_HEALTH_REPORTS_KEY, rows);
}

function makeSuperadminUser(email: string): User {
  const now = new Date().toISOString();
  return {
    id: SUPERADMIN_ID,
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { role: 'superadmin', full_name: 'Alex Rivera' },
    aud: 'authenticated',
    created_at: now,
    email: email.toLowerCase(),
    email_confirmed_at: now,
    phone: '',
    confirmed_at: now,
    last_sign_in_at: now,
    role: 'authenticated',
    updated_at: now,
    identities: [],
    factors: [],
  } as User;
}

function makeSession(user: User, accessToken: string): Session {
  return {
    access_token: accessToken,
    refresh_token: 'mock-refresh',
    expires_in: 60 * 60 * 24 * 7,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    token_type: 'bearer',
    user,
  };
}

function notifyAuth(event: string, session: Session | null) {
  authListeners.forEach((cb) => {
    try {
      cb(event, session);
    } catch {
      /* ignore */
    }
  });
}

function createMockQuery(table: string) {
  const filters: Record<string, any> = {};
  let op: 'select' | 'update' | 'insert' | 'upsert' | 'delete' = 'select';
  let updatePayload: any = null;
  let returningAfterWrite = false;

  const api: any = {
    select(_cols?: string) {
      // Supabase chain: insert(...).select() keeps the write op.
      if (op === 'insert' || op === 'upsert' || op === 'update') {
        returningAfterWrite = true;
      } else {
        op = 'select';
      }
      return api;
    },
    insert(payload: any) {
      op = 'insert';
      updatePayload = payload;
      return api;
    },
    upsert(payload: any) {
      op = 'upsert';
      updatePayload = payload;
      return api;
    },
    update(payload: any) {
      op = 'update';
      updatePayload = payload;
      return api;
    },
    delete() {
      op = 'delete';
      return api;
    },
    eq(col: string, val: any) {
      filters[col] = val;
      return api;
    },
    in(col: string, vals: any[]) {
      filters[`${col}__in`] = vals;
      return api;
    },
    order() {
      return api;
    },
    limit() {
      return api;
    },
    maybeSingle() {
      return Promise.resolve(resolveRow());
    },
    single() {
      return Promise.resolve(resolveRow());
    },
    then(onfulfilled: any, onrejected: any) {
      // Write chains (insert/upsert/update) resolve via resolveRow so localStorage persists.
      if (op === 'insert' || op === 'upsert' || op === 'update' || op === 'delete') {
        const written = resolveRow();
        const payload = returningAfterWrite
          ? emptyResult(written.data ? [written.data] : [])
          : written;
        return Promise.resolve(payload).then(onfulfilled, onrejected);
      }
      return Promise.resolve(resolveList()).then(onfulfilled, onrejected);
    },
  };

  function resolveRow(): MockQueryResult {
    const auth = readMockAuth();

    if (table === 'profiles') {
      if (auth && (!filters.id || filters.id === auth.user.id)) {
        const base = {
          id: auth.user.id,
          email: auth.user.email,
          is_admin: true,
          role: 'superadmin',
          first_name: 'Alex',
          last_name: 'Rivera',
          name: 'Alex Rivera',
          country: 'US',
          timezone: 'America/New_York',
          locale: 'en',
          avatar_url: null,
          custom_fields: {},
        };
        if (op === 'update' || op === 'upsert') {
          return emptyResult({ ...base, ...updatePayload });
        }
        return emptyResult(base);
      }
      return emptyResult(null);
    }

    if (table === 'user_subscriptions') {
      if (auth && (!filters.user_id || filters.user_id === auth.user.id)) {
        return emptyResult({
          id: 'mock-sub-1',
          user_id: auth.user.id,
          status: 'active',
          plan_id: 'max',
          billing_period: 'monthly',
        });
      }
      return emptyResult(null);
    }

    if (table === 'subscription_plans') {
      return emptyResult(null);
    }

    if (table === 'questionnaire_responses') {
      const userId = filters.user_id || auth?.user.id;
      if (!userId) return emptyResult(null);

      if (op === 'upsert' || op === 'update' || op === 'insert') {
        const payload = Array.isArray(updatePayload) ? updatePayload[0] : updatePayload;
        const prev = readMockQuestionnaire(userId) || { user_id: userId };
        const next = {
          ...prev,
          ...payload,
          user_id: userId,
          updated_at: new Date().toISOString(),
        };
        writeMockQuestionnaire(userId, next);
        return emptyResult(next);
      }

      const row = readMockQuestionnaire(userId);
      return emptyResult(row);
    }

    if (table === 'health_reports') {
      const userId = filters.user_id || auth?.user.id;
      const all = readMockHealthReports();

      if (op === 'insert' || op === 'upsert') {
        const payload = Array.isArray(updatePayload) ? updatePayload[0] : updatePayload;
        const now = new Date().toISOString();
        const row = {
          id: payload?.id || `mock-report-${Date.now()}`,
          created_at: now,
          updated_at: now,
          status: 'completed',
          report_title: payload?.topic || payload?.report_type || 'Health report',
          metadata: {},
          ...payload,
          user_id: payload?.user_id || userId,
        };
        writeMockHealthReports([row, ...all]);
        return emptyResult(row);
      }

      const filtered = userId ? all.filter((r) => r.user_id === userId) : all;
      if (filters.id) {
        return emptyResult(filtered.find((r) => r.id === filters.id) || null);
      }
      return emptyResult(filtered[0] || null);
    }

    if (table === 'report_settings') {
      const userId = filters.user_id || auth?.user.id;
      const all = readMockJson<Array<Record<string, unknown>>>(MOCK_REPORT_SETTINGS_KEY, []);
      if (op === 'insert' || op === 'upsert' || op === 'update') {
        const payload = Array.isArray(updatePayload) ? updatePayload[0] : updatePayload;
        const uid = payload?.user_id || userId;
        const next = {
          id: payload?.id || `mock-settings-${uid}`,
          updated_at: new Date().toISOString(),
          ...payload,
          user_id: uid,
        };
        const others = all.filter((r) => r.user_id !== uid);
        writeMockJson(MOCK_REPORT_SETTINGS_KEY, [next, ...others]);
        return emptyResult(next);
      }
      return emptyResult(all.find((r) => r.user_id === userId) || null);
    }

    if (table === 'shareable_reports') {
      const userId = filters.user_id || auth?.user.id;
      const all = readMockJson<Array<Record<string, unknown>>>(MOCK_SHAREABLE_REPORTS_KEY, []);
      if (op === 'insert' || op === 'upsert') {
        const payload = Array.isArray(updatePayload) ? updatePayload[0] : updatePayload;
        const now = new Date().toISOString();
        const row = {
          id: payload?.id || `mock-share-${Date.now()}`,
          created_at: now,
          views: 0,
          ...payload,
          user_id: payload?.user_id || userId,
        };
        writeMockJson(MOCK_SHAREABLE_REPORTS_KEY, [row, ...all]);
        return emptyResult(row);
      }
      if (op === 'delete') {
        const next = all.filter((r) => r.id !== filters.id);
        writeMockJson(MOCK_SHAREABLE_REPORTS_KEY, next);
        return emptyResult(null);
      }
      if (op === 'update') {
        const idx = all.findIndex((r) => r.id === filters.id);
        if (idx < 0) return emptyResult(null);
        const next = { ...all[idx], ...updatePayload, updated_at: new Date().toISOString() };
        const copy = [...all];
        copy[idx] = next;
        writeMockJson(MOCK_SHAREABLE_REPORTS_KEY, copy);
        return emptyResult(next);
      }
      if (filters.share_token) {
        return emptyResult(all.find((r) => r.share_token === filters.share_token) || null);
      }
      return emptyResult(all.find((r) => r.user_id === userId) || null);
    }

    if (table === 'medical_files') {
      const userId = filters.user_id || auth?.user.id;
      const all = readMockJson<Array<Record<string, unknown>>>(MOCK_MEDICAL_FILES_KEY, []);
      if (op === 'insert' || op === 'upsert') {
        const payload = Array.isArray(updatePayload) ? updatePayload[0] : updatePayload;
        const row = {
          id: `mock-file-${Date.now()}`,
          created_at: new Date().toISOString(),
          ...payload,
          user_id: payload?.user_id || userId,
        };
        writeMockJson(MOCK_MEDICAL_FILES_KEY, [row, ...all]);
        return emptyResult(row);
      }
      const filtered = userId ? all.filter((r) => r.user_id === userId) : all;
      return emptyResult(filtered[0] || null);
    }

    if (table === 'user_devices') {
      const userId = filters.user_id || auth?.user.id;
      const all = readMockJson<Array<Record<string, unknown>>>(MOCK_USER_DEVICES_KEY, []);
      if (op === 'insert' || op === 'upsert') {
        const payload = Array.isArray(updatePayload) ? updatePayload[0] : updatePayload;
        const row = {
          id: payload?.id || `mock-device-${Date.now()}`,
          created_at: new Date().toISOString(),
          status: 'active',
          ...payload,
          user_id: payload?.user_id || userId,
        };
        writeMockJson(MOCK_USER_DEVICES_KEY, [row, ...all]);
        return emptyResult(row);
      }
      const filtered = userId ? all.filter((r) => r.user_id === userId) : all;
      return emptyResult(filtered[0] || null);
    }

    return emptyResult(null);
  }

  function resolveList(): MockQueryResult {
    if (table === 'subscription_plans') {
      return emptyResult([
        {
          id: 'core',
          name: 'Core',
          description: 'Core plan',
          tier_level: 1,
          monthly_price_cents: 0,
          value_message: 'Dev',
        },
        {
          id: 'max',
          name: 'Max',
          description: 'Max plan',
          tier_level: 3,
          monthly_price_cents: 0,
          value_message: 'Dev',
        },
      ]);
    }

    if (table === 'health_reports') {
      const auth = readMockAuth();
      const userId = filters.user_id || auth?.user.id;
      const all = readMockHealthReports();
      return emptyResult(userId ? all.filter((r) => r.user_id === userId) : all);
    }

    if (table === 'report_settings') {
      const auth = readMockAuth();
      const userId = filters.user_id || auth?.user.id;
      const all = readMockJson<Array<Record<string, unknown>>>(MOCK_REPORT_SETTINGS_KEY, []);
      return emptyResult(userId ? all.filter((r) => r.user_id === userId) : all);
    }

    if (table === 'shareable_reports') {
      const auth = readMockAuth();
      const userId = filters.user_id || auth?.user.id;
      const all = readMockJson<Array<Record<string, unknown>>>(MOCK_SHAREABLE_REPORTS_KEY, []);
      if (filters.share_token) {
        return emptyResult(all.filter((r) => r.share_token === filters.share_token));
      }
      return emptyResult(userId ? all.filter((r) => r.user_id === userId) : all);
    }

    if (table === 'medical_files') {
      const auth = readMockAuth();
      const userId = filters.user_id || auth?.user.id;
      const all = readMockJson<Array<Record<string, unknown>>>(MOCK_MEDICAL_FILES_KEY, []);
      return emptyResult(userId ? all.filter((r) => r.user_id === userId) : all);
    }

    if (table === 'user_devices') {
      const auth = readMockAuth();
      const userId = filters.user_id || auth?.user.id;
      const all = readMockJson<Array<Record<string, unknown>>>(MOCK_USER_DEVICES_KEY, []);
      return emptyResult(userId ? all.filter((r) => r.user_id === userId) : all);
    }

    if (table === 'questionnaire_responses') {
      const auth = readMockAuth();
      const userId = filters.user_id || auth?.user.id;
      const row = userId ? readMockQuestionnaire(userId) : null;
      return emptyResult(row ? [row] : []);
    }

    const row = resolveRow();
    return emptyResult(row.data ? [row.data] : []);
  }

  return api;
}

function createMockChannel() {
  return {
    on: () => createMockChannel(),
    subscribe: () => createMockChannel(),
    unsubscribe: async () => 'ok',
    send: async () => 'ok',
    track: async () => 'ok',
    untrack: async () => 'ok',
  };
}

function createMockSupabaseClient() {
  return {
    auth: {
      getSession: async () => {
        const auth = readMockAuth();
        if (!auth) return { data: { session: null }, error: null };
        return {
          data: { session: makeSession(auth.user, auth.access_token) },
          error: null,
        };
      },
      getUser: async () => {
        const auth = readMockAuth();
        return { data: { user: auth?.user ?? null }, error: null };
      },
      onAuthStateChange: (cb: AuthListener) => {
        authListeners.add(cb);
        const auth = readMockAuth();
        queueMicrotask(() => {
          cb(
            auth ? 'INITIAL_SESSION' : 'SIGNED_OUT',
            auth ? makeSession(auth.user, auth.access_token) : null,
          );
        });
        return {
          data: {
            subscription: {
              unsubscribe: () => authListeners.delete(cb),
            },
          },
        };
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const trimmed = (email || '').trim();
        if (!trimmed || !password) {
          return {
            data: { user: null, session: null },
            error: { message: 'Email and password are required' },
          };
        }

        // Local mock: listed superadmin emails get full access for testing
        if (!isSuperadminEmail(trimmed)) {
          return {
            data: { user: null, session: null },
            error: {
              name: 'AuthApiError',
              message: `Mock login: use exactly ${SUPERADMIN_EMAILS[0]} (check for typos like .cocm). Password can be anything in local mock mode.`,
              status: 400,
            },
          };
        }

        const user = makeSuperadminUser(trimmed);
        const access_token = `mock-token-${user.id}`;
        writeMockAuth({ user, access_token });
        // Seed questionnaire once so personalized report generation is not gated empty.
        const existingQ = readMockQuestionnaire(user.id);
        const life = (existingQ?.lifestyle || {}) as Record<string, unknown>;
        if (!existingQ || !life.sleep_duration) {
          writeMockQuestionnaire(user.id, buildMockQuestionnaireRow(user.id));
        }
        const devices = readMockJson<Array<Record<string, unknown>>>(MOCK_USER_DEVICES_KEY, []);
        if (!devices.some((d) => d.user_id === user.id)) {
          writeMockJson(MOCK_USER_DEVICES_KEY, [
            {
              id: 'mock-device-watch-1',
              user_id: user.id,
              brand: 'Apple',
              device_name: 'Apple Watch',
              status: 'active',
              created_at: new Date().toISOString(),
            },
            ...devices,
          ]);
        }
        const session = makeSession(user, access_token);
        notifyAuth('SIGNED_IN', session);
        return { data: { user, session }, error: null };
      },
      signUp: async () => ({
        data: { user: null, session: null },
        error: { message: 'Sign up disabled in mock mode' },
      }),
      signOut: async () => {
        writeMockAuth(null);
        notifyAuth('SIGNED_OUT', null);
        return { error: null };
      },
      resetPasswordForEmail: async () => ({ data: {}, error: null }),
      updateUser: async () => ({ data: { user: readMockAuth()?.user ?? null }, error: null }),
      signInWithOAuth: async () => ({
        data: { provider: null, url: null },
        error: { message: 'OAuth disabled in mock mode' },
      }),
      linkIdentity: async () => ({ data: { provider: null, url: null }, error: null }),
      unlinkIdentity: async () => ({ data: null, error: null }),
    },
    from: (table: string) => createMockQuery(table),
    rpc: async (fn: string) => {
      if (fn === 'check_advanced_mode_prerequisites') {
        return emptyResult(true);
      }
      if (fn === 'increment_shareable_report_views') {
        return emptyResult(null);
      }
      return emptyResult(null);
    },
    channel: () => createMockChannel(),
    removeChannel: async () => 'ok',
    removeAllChannels: async () => [],
    storage: {
      from: () => ({
        upload: async (path: string) => ({ data: { path }, error: null }),
        download: async () => ({ data: null, error: null }),
        remove: async () => ({ data: null, error: null }),
        list: async () => ({ data: [], error: null }),
        createSignedUrl: async () => ({ data: { signedUrl: '' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
    functions: {
      invoke: async () => ({ data: null, error: null }),
    },
  };
}

function isValidHttpUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
/** Explicit opt-in only — never infer mock from missing credentials (unsafe on deployed builds). */
const useMock = import.meta.env.VITE_MOCK_MODE === '1';

if (useMock) {
  console.info(
    '[supabase] Mock auth active — sign in with superadmin email to access Member Zone & Admin.',
  );
} else if (!isValidHttpUrl(rawUrl) || !rawKey?.trim()) {
  throw new Error(
    '[supabase] Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY. ' +
      'Set them for production/preview, or use VITE_MOCK_MODE=1 for local/dev only.',
  );
}

export const supabase = useMock
  ? (createMockSupabaseClient() as unknown as ReturnType<typeof createClient>)
  : createClient(rawUrl, rawKey.trim());

export const isSupabaseMock = useMock;
