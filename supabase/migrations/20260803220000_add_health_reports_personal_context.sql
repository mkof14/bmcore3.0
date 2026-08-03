/*
  # Personal context snapshots on health reports

  1. Changes
    - Add `personal_context_snapshot` jsonb for report-time personalization payload
    - Add `personal_context_version` text for snapshot schema versioning
    - Add `metadata` jsonb for flexible report-side annotations (fallback storage)

  2. Notes
    - No PHI file URLs should be stored in these columns — counts/categories only
    - Existing rows remain valid (nullable / default empty metadata)
*/

ALTER TABLE IF EXISTS public.health_reports
  ADD COLUMN IF NOT EXISTS personal_context_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS personal_context_version text,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_health_reports_personal_context_version
  ON public.health_reports (personal_context_version)
  WHERE personal_context_version IS NOT NULL;
