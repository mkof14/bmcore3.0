/**
 * Private-path helpers for medical file uploads.
 * Prefers a private `medical-files` Storage bucket when configured;
 * falls back to metadata-only (URL) when Storage is unavailable.
 */

import { supabase, isSupabaseMock } from './supabase';

export const MEDICAL_FILES_BUCKET = 'medical-files';
export const MEDICAL_FILES_LOCAL_MIRROR_KEY = 'bmcore.medical.files';

/** Clear any legacy PHI mirror from localStorage (safe no-op if missing). */
export function clearMedicalFilesLocalMirror(): void {
  try {
    localStorage.removeItem(MEDICAL_FILES_LOCAL_MIRROR_KEY);
  } catch {
    // ignore
  }
}

/** Private object path: `{userId}/{timestamp}-{safeName}` */
export function buildMedicalFileStoragePath(userId: string, fileName: string): string {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120) || 'file';
  return `${userId}/${Date.now()}-${safe}`;
}

export type MedicalUploadResult =
  | { ok: true; path: string; signedUrl: string | null; publicFallbackUrl: string | null }
  | { ok: false; error: string };

/**
 * Attempt private Storage upload. Returns signed URL when possible.
 * Callers should still persist metadata in `medical_files` with the storage path or URL.
 */
export async function uploadMedicalFileToStorage(
  file: File,
  userId: string,
): Promise<MedicalUploadResult> {
  if (isSupabaseMock) {
    return { ok: false, error: 'mock' };
  }

  const path = buildMedicalFileStoragePath(userId, file.name);

  try {
    const { error: uploadError } = await supabase.storage
      .from(MEDICAL_FILES_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      return { ok: false, error: uploadError.message };
    }

    const { data: signed, error: signError } = await supabase.storage
      .from(MEDICAL_FILES_BUCKET)
      .createSignedUrl(path, 60 * 60);

    if (!signError && signed?.signedUrl) {
      return { ok: true, path, signedUrl: signed.signedUrl, publicFallbackUrl: null };
    }

    // Path stored as opaque reference when signed URL unavailable
    return { ok: true, path, signedUrl: null, publicFallbackUrl: `storage://${MEDICAL_FILES_BUCKET}/${path}` };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Upload failed',
    };
  }
}

/** Resolve a view/download URL for a stored medical file reference. */
export async function resolveMedicalFileUrl(fileUrl: string): Promise<string | null> {
  if (!fileUrl) return null;
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://') || fileUrl.startsWith('blob:') || fileUrl.startsWith('data:')) {
    return fileUrl;
  }

  const storagePrefix = `storage://${MEDICAL_FILES_BUCKET}/`;
  if (fileUrl.startsWith(storagePrefix)) {
    const path = fileUrl.slice(storagePrefix.length);
    const { data, error } = await supabase.storage
      .from(MEDICAL_FILES_BUCKET)
      .createSignedUrl(path, 60 * 30);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  }

  // Treat bare private paths as bucket-relative
  if (!fileUrl.includes('://')) {
    const { data, error } = await supabase.storage
      .from(MEDICAL_FILES_BUCKET)
      .createSignedUrl(fileUrl, 60 * 30);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  }

  return fileUrl;
}
