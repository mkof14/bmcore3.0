import { useEffect, useState } from 'react';
import {
  Edit2,
  Eye,
  EyeOff,
  FileText,
  Film,
  Plus,
  Presentation,
  Trash2,
  Upload,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  createMediaItem,
  deleteMediaItem,
  listMediaItems,
  type MediaItem,
  type MediaType,
  updateMediaItem,
  uploadMediaFile,
} from '../../lib/mediaStore';
import { notifyError, notifySuccess } from '../../lib/adminNotify';
import StateCard from '../ui/StateCard';
import ErrorBanner from '../ui/ErrorBanner';
import ModalShell from '../ui/ModalShell';

type FormState = {
  title: string;
  description: string;
  media_type: MediaType;
  file_url: string;
  thumbnail_url: string;
  file_name: string;
  mime_type: string;
  sort_order: number;
  is_published: boolean;
};

const emptyForm = (): FormState => ({
  title: '',
  description: '',
  media_type: 'video',
  file_url: '',
  thumbnail_url: '',
  file_name: '',
  mime_type: '',
  sort_order: 0,
  is_published: false,
});

export default function MediaManager() {
  const { t } = useTranslation();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  useEffect(() => {
    void loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    const result = await listMediaItems();
    if (result.error) {
      setError(t('admin.media.loadError'));
      notifyError(t('admin.media.loadError'));
      setItems([]);
    } else {
      setError(null);
      setItems(result.data);
    }
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setShowForm(true);
  }

  function openEdit(item: MediaItem) {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description || '',
      media_type: item.media_type,
      file_url: item.file_url,
      thumbnail_url: item.thumbnail_url || '',
      file_name: item.file_name || '',
      mime_type: item.mime_type || '',
      sort_order: item.sort_order,
      is_published: item.is_published,
    });
    setShowForm(true);
  }

  async function handleFileUpload(
    file: File | null,
    kind: 'file' | 'thumbnail',
  ) {
    if (!file) return;
    if (kind === 'file') setUploadingFile(true);
    else setUploadingThumb(true);

    const result = await uploadMediaFile(
      file,
      kind === 'file' ? 'files' : 'thumbnails',
    );

    if (result.error || !result.url) {
      notifyError(t('admin.media.uploadFailed'));
    } else if (kind === 'file') {
      setForm((prev) => ({
        ...prev,
        file_url: result.url!,
        file_name: file.name,
        mime_type: file.type || prev.mime_type,
      }));
      notifySuccess(t('admin.media.uploadSuccess'));
    } else {
      setForm((prev) => ({ ...prev, thumbnail_url: result.url! }));
      notifySuccess(t('admin.media.uploadSuccess'));
    }

    if (kind === 'file') setUploadingFile(false);
    else setUploadingThumb(false);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.file_url.trim()) {
      notifyError(t('admin.media.requiredFields'));
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description,
      media_type: form.media_type,
      file_url: form.file_url,
      thumbnail_url: form.thumbnail_url || null,
      file_name: form.file_name || null,
      mime_type: form.mime_type || null,
      sort_order: Number.isFinite(form.sort_order) ? form.sort_order : 0,
      is_published: form.is_published,
    };

    const result = editing
      ? await updateMediaItem(editing.id, payload)
      : await createMediaItem(payload);

    if (result.error) {
      notifyError(t('admin.media.saveFailed'));
    } else {
      notifySuccess(t('admin.media.saveSuccess'));
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm());
      await loadItems();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm(t('admin.media.confirmDelete'))) return;
    const result = await deleteMediaItem(id);
    if (result.error) {
      notifyError(t('admin.media.deleteFailed'));
      return;
    }
    notifySuccess(t('admin.media.deleteSuccess'));
    await loadItems();
  }

  async function togglePublished(item: MediaItem) {
    const result = await updateMediaItem(item.id, {
      is_published: !item.is_published,
    });
    if (result.error) {
      notifyError(t('admin.media.saveFailed'));
      return;
    }
    notifySuccess(t('admin.media.saveSuccess'));
    await loadItems();
  }

  function typeIcon(type: MediaType) {
    if (type === 'video') return <Film className="h-5 w-5" />;
    if (type === 'presentation') return <Presentation className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  }

  if (loading) {
    return (
      <StateCard
        title={t('admin.media.loading')}
        description={t('admin.media.loadingBody')}
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="flex items-center gap-3 text-3xl font-semibold text-gray-900">
          <Film className="h-8 w-8 text-orange-500" />
          {t('admin.media.title')}
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadItems()}
            className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-gray-700 transition-colors hover:border-orange-300"
          >
            {t('admin.media.refresh')}
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700"
          >
            <Plus className="h-5 w-5" />
            {t('admin.media.addItem')}
          </button>
        </div>
      </div>

      <p className="mb-6 max-w-3xl text-sm text-gray-600">{t('admin.media.subtitle')}</p>

      {error && <ErrorBanner message={error} className="mb-4" />}

      {items.length === 0 ? (
        <StateCard
          title={t('admin.media.emptyTitle')}
          description={t('admin.media.emptyBody')}
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 gap-4">
                  <div className="rounded-2xl border border-orange-200 bg-orange-50 p-3 text-orange-600">
                    {typeIcon(item.media_type)}
                  </div>
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {t(`admin.media.types.${item.media_type}`)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.is_published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {item.is_published
                          ? t('admin.media.published')
                          : t('admin.media.draft')}
                      </span>
                    </div>
                    {item.description ? (
                      <p className="mb-2 line-clamp-2 text-sm text-gray-600">{item.description}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>
                        {t('admin.media.orderLabel')}: {item.sort_order}
                      </span>
                      {item.file_name ? <span>{item.file_name}</span> : null}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void togglePublished(item)}
                    className="rounded-lg p-2 transition-colors hover:bg-slate-100"
                    title={
                      item.is_published
                        ? t('admin.media.unpublish')
                        : t('admin.media.publish')
                    }
                  >
                    {item.is_published ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="rounded-lg p-2 transition-colors hover:bg-slate-100"
                    title={t('admin.media.edit')}
                  >
                    <Edit2 className="h-5 w-5 text-blue-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(item.id)}
                    className="rounded-lg p-2 transition-colors hover:bg-slate-100"
                    title={t('admin.media.delete')}
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ModalShell
          title={editing ? t('admin.media.editItem') : t('admin.media.addItem')}
          icon={<Upload className="h-6 w-6 text-orange-500" />}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          panelClassName="max-w-2xl"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t('admin.media.fields.title')}
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder={t('admin.media.placeholders.title')}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t('admin.media.fields.description')}
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder={t('admin.media.placeholders.description')}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t('admin.media.fields.type')}
                </label>
                <select
                  value={form.media_type}
                  onChange={(e) =>
                    setForm({ ...form, media_type: e.target.value as MediaType })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="video">{t('admin.media.types.video')}</option>
                  <option value="presentation">{t('admin.media.types.presentation')}</option>
                  <option value="document">{t('admin.media.types.document')}</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t('admin.media.fields.sortOrder')}
                </label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm({ ...form, sort_order: Number(e.target.value) || 0 })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t('admin.media.fields.fileUrl')}
              </label>
              <input
                type="text"
                value={form.file_url}
                onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder={t('admin.media.placeholders.fileUrl')}
              />
              <div className="mt-2">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-orange-700 hover:text-orange-800">
                  <Upload className="h-4 w-4" />
                  {uploadingFile
                    ? t('admin.media.uploading')
                    : t('admin.media.uploadFile')}
                  <input
                    type="file"
                    className="hidden"
                    disabled={uploadingFile}
                    onChange={(e) =>
                      void handleFileUpload(e.target.files?.[0] || null, 'file')
                    }
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t('admin.media.fields.thumbnailUrl')}
              </label>
              <input
                type="text"
                value={form.thumbnail_url}
                onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder={t('admin.media.placeholders.thumbnailUrl')}
              />
              <div className="mt-2">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-orange-700 hover:text-orange-800">
                  <Upload className="h-4 w-4" />
                  {uploadingThumb
                    ? t('admin.media.uploading')
                    : t('admin.media.uploadThumbnail')}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingThumb}
                    onChange={(e) =>
                      void handleFileUpload(e.target.files?.[0] || null, 'thumbnail')
                    }
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) =>
                    setForm({ ...form, is_published: e.target.checked })
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-orange-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-200" />
              </label>
              <span className="text-sm text-gray-600">{t('admin.media.fields.published')}</span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || uploadingFile || uploadingThumb}
              className="rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-2 text-white transition-all hover:from-orange-500 hover:to-orange-600 disabled:opacity-50"
            >
              {saving ? t('admin.media.saving') : t('common.save')}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
              className="rounded-lg bg-slate-200 px-6 py-2 text-gray-700 transition-colors hover:bg-slate-300"
            >
              {t('common.cancel')}
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
