import { adminDb } from './adminApi';
import { isSupabaseMock, supabase } from './supabase';

export type MediaType = 'video' | 'presentation' | 'document';

export interface MediaItem {
  id: string;
  title: string;
  description: string;
  media_type: MediaType;
  file_url: string;
  thumbnail_url: string | null;
  file_name: string | null;
  mime_type: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type MediaItemInput = {
  title: string;
  description?: string;
  media_type: MediaType;
  file_url: string;
  thumbnail_url?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
  sort_order?: number;
  is_published?: boolean;
};

const MOCK_KEY = 'bmcore.media_items.v1';
const MEDIA_BUCKET = 'media';

function readMockItems(): MediaItem[] {
  try {
    const raw = localStorage.getItem(MOCK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMockItems(items: MediaItem[]) {
  localStorage.setItem(MOCK_KEY, JSON.stringify(items));
}

function sortItems(items: MediaItem[]): MediaItem[] {
  return [...items].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function getVideoEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname.startsWith('/embed/')) return url;
      const id = parsed.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
      const shorts = parsed.pathname.match(/^\/shorts\/([^/]+)/);
      if (shorts?.[1]) return `https://www.youtube.com/embed/${shorts[1]}`;
    }

    if (host === 'vimeo.com') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    if (host === 'player.vimeo.com') return url;
  } catch {
    return null;
  }
  return null;
}

export async function listMediaItems(options?: {
  publishedOnly?: boolean;
}): Promise<{ data: MediaItem[]; error: string | null }> {
  const publishedOnly = options?.publishedOnly ?? false;

  if (isSupabaseMock) {
    let items = sortItems(readMockItems());
    if (publishedOnly) items = items.filter((item) => item.is_published);
    return { data: items, error: null };
  }

  try {
    let query = supabase
      .from('media_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (publishedOnly) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query;
    if (error) return { data: [], error: error.message };
    return { data: (data as MediaItem[]) || [], error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Failed to load media',
    };
  }
}

export async function createMediaItem(
  input: MediaItemInput,
): Promise<{ data: MediaItem | null; error: string | null }> {
  const now = new Date().toISOString();
  const payload = {
    title: input.title.trim(),
    description: (input.description || '').trim(),
    media_type: input.media_type,
    file_url: input.file_url.trim(),
    thumbnail_url: input.thumbnail_url?.trim() || null,
    file_name: input.file_name || null,
    mime_type: input.mime_type || null,
    sort_order: input.sort_order ?? 0,
    is_published: input.is_published ?? false,
  };

  if (isSupabaseMock) {
    const item: MediaItem = {
      id: crypto.randomUUID(),
      ...payload,
      created_at: now,
      updated_at: now,
    };
    const items = readMockItems();
    writeMockItems([item, ...items]);
    return { data: item, error: null };
  }

  const result = await adminDb({
    table: 'media_items',
    action: 'insert',
    data: payload,
  });

  if (!result.ok) return { data: null, error: result.error || 'Create failed' };
  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  return { data: (row as MediaItem) || null, error: null };
}

export async function updateMediaItem(
  id: string,
  input: Partial<MediaItemInput>,
): Promise<{ data: MediaItem | null; error: string | null }> {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) payload.title = input.title.trim();
  if (input.description !== undefined) payload.description = input.description.trim();
  if (input.media_type !== undefined) payload.media_type = input.media_type;
  if (input.file_url !== undefined) payload.file_url = input.file_url.trim();
  if (input.thumbnail_url !== undefined) {
    payload.thumbnail_url = input.thumbnail_url?.trim() || null;
  }
  if (input.file_name !== undefined) payload.file_name = input.file_name || null;
  if (input.mime_type !== undefined) payload.mime_type = input.mime_type || null;
  if (input.sort_order !== undefined) payload.sort_order = input.sort_order;
  if (input.is_published !== undefined) payload.is_published = input.is_published;

  if (isSupabaseMock) {
    const items = readMockItems();
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) return { data: null, error: 'Item not found' };
    const updated = { ...items[index], ...payload } as MediaItem;
    items[index] = updated;
    writeMockItems(items);
    return { data: updated, error: null };
  }

  const result = await adminDb({
    table: 'media_items',
    action: 'update',
    data: payload,
    match: { id },
  });

  if (!result.ok) return { data: null, error: result.error || 'Update failed' };
  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  return { data: (row as MediaItem) || null, error: null };
}

export async function deleteMediaItem(
  id: string,
): Promise<{ error: string | null }> {
  if (isSupabaseMock) {
    writeMockItems(readMockItems().filter((item) => item.id !== id));
    return { error: null };
  }

  const result = await adminDb({
    table: 'media_items',
    action: 'delete',
    match: { id },
  });

  if (!result.ok) return { error: result.error || 'Delete failed' };
  return { error: null };
}

export async function uploadMediaFile(
  file: File,
  folder: 'files' | 'thumbnails' = 'files',
): Promise<{ url: string | null; error: string | null }> {
  if (isSupabaseMock) {
    try {
      const url = await fileToDataUrl(file);
      return { url, error: null };
    } catch {
      return { url: null, error: 'Mock upload failed' };
    }
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { url: null, error: 'Authentication required' };

    const ext = file.name.split('.').pop() || 'bin';
    const path = `${folder}/${user.id}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
    return { url: publicUrl, error: null };
  } catch (err) {
    return {
      url: null,
      error: err instanceof Error ? err.message : 'Upload failed',
    };
  }
}
