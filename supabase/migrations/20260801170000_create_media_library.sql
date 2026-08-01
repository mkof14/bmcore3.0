/*
  # Public Media Library

  1. New Tables
    - `media_items`
      - Videos, presentations, and documents shown on the public Media page
      - Admin-managed via admin-db edge function

  2. Storage
    - `media` bucket for uploaded files and thumbnails (public read)

  3. Security
    - Public can SELECT published items
    - Admins can manage all rows (via is_admin_cached)
    - Admins can upload/update/delete objects in the media bucket
*/

CREATE TABLE IF NOT EXISTS media_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  media_type text NOT NULL CHECK (media_type IN ('video', 'presentation', 'document')),
  file_url text NOT NULL,
  thumbnail_url text,
  file_name text,
  mime_type text,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_items_type_published
  ON media_items (media_type, is_published, sort_order);

CREATE INDEX IF NOT EXISTS idx_media_items_sort
  ON media_items (sort_order ASC, created_at DESC);

ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published media" ON media_items;
CREATE POLICY "Public can view published media"
  ON media_items FOR SELECT
  TO anon, authenticated
  USING (is_published = true OR public.is_admin_cached(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert media" ON media_items;
CREATE POLICY "Admins can insert media"
  ON media_items FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_cached(auth.uid()));

DROP POLICY IF EXISTS "Admins can update media" ON media_items;
CREATE POLICY "Admins can update media"
  ON media_items FOR UPDATE
  TO authenticated
  USING (public.is_admin_cached(auth.uid()))
  WITH CHECK (public.is_admin_cached(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete media" ON media_items;
CREATE POLICY "Admins can delete media"
  ON media_items FOR DELETE
  TO authenticated
  USING (public.is_admin_cached(auth.uid()));

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  104857600, -- 100MB
  ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view media files" ON storage.objects;
CREATE POLICY "Public can view media files"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Admins can upload media files" ON storage.objects;
CREATE POLICY "Admins can upload media files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'media'
    AND public.is_admin_cached(auth.uid())
  );

DROP POLICY IF EXISTS "Admins can update media files" ON storage.objects;
CREATE POLICY "Admins can update media files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'media'
    AND public.is_admin_cached(auth.uid())
  )
  WITH CHECK (
    bucket_id = 'media'
    AND public.is_admin_cached(auth.uid())
  );

DROP POLICY IF EXISTS "Admins can delete media files" ON storage.objects;
CREATE POLICY "Admins can delete media files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'media'
    AND public.is_admin_cached(auth.uid())
  );
