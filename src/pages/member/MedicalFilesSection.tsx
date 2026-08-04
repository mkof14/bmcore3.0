import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Upload,
  Download,
  Share2,
  Printer,
  Trash2,
  Eye,
  Search,
  FileImage,
  Camera,
  Copy,
  Mic,
  CheckCircle2,
  Clock3,
  Sparkles,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notifyUserError, notifyUserInfo, notifyUserSuccess } from '../../lib/adminNotify';
import ModalShell from '../../components/ui/ModalShell';
import {
  clearMedicalFilesLocalMirror,
  resolveMedicalFileUrl,
  uploadMedicalFileToStorage,
} from '../../lib/medicalFilesStorage';
import {
  INTAKE_KINDS,
  buildHealthRecordInsights,
  buildRecordHealthGuidePrompt,
  categoryForIntakeKind,
  deriveIntakeStatus,
  intakeKindFromCategory,
  openHealthGuideWithPrompt,
  parseHealthRecordMetadata,
  shouldPersistStatusAdvance,
  type HealthRecordInsights,
  type IntakeKind,
  type IntakeStatus,
} from '../../lib/healthRecords';
import {
  buildPersonalContext,
  invalidatePersonalContextCache,
  type PersonalContext,
} from '../../lib/personalContext';
import {
  copyReportText,
  downloadReportTxt,
  shareReportContent,
} from '../../lib/reports/formatReportText';

interface MedicalFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  category: string;
  upload_date: string;
  tags: string[];
  ocr_extracted_text: string | null;
  metadata?: Record<string, unknown> | null;
}

const CATEGORY_KEYS = [
  'labResults',
  'imaging',
  'dnaReport',
  'rawDna',
  'xray',
  'mri',
  'ctScan',
  'prescription',
  'report',
  'other',
] as const;

const ACCEPT_UPLOAD =
  '.pdf,.png,.jpg,.jpeg,.webp,.csv,.txt,.vcf,.tsv,image/*,application/pdf,text/csv,text/plain';

const STATUS_ICON: Record<IntakeStatus, typeof Clock3> = {
  received: Clock3,
  in_review: Loader2,
  insights_ready: CheckCircle2,
};

function inferFileType(file: File, intakeKind: IntakeKind): string {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (intakeKind === 'raw_dna' || ext === 'vcf') return 'raw_dna';
  if (file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return 'image';
  if (ext === 'pdf' || file.type === 'application/pdf') return 'pdf';
  if (['csv', 'tsv', 'txt'].includes(ext) || file.type.startsWith('text/')) return 'document';
  return 'document';
}

export default function MedicalFilesSection() {
  const { t, i18n } = useTranslation();
  const [files, setFiles] = useState<MedicalFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [intakeKind, setIntakeKind] = useState<IntakeKind>('labs');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [personalContext, setPersonalContext] = useState<PersonalContext | null>(null);
  const [statusTick, setStatusTick] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const insightsPrintRef = useRef<HTMLDivElement>(null);
  const [uploadForm, setUploadForm] = useState({
    file_name: '',
    file_url: '',
    tags: '',
    selectedFile: null as File | null,
    source: 'upload' as 'upload' | 'camera',
  });

  const categoryLabel = (key: string) =>
    t(`member.medicalFiles.categories.${key}`, { defaultValue: key });

  const statusLabel = (status: IntakeStatus) => t(`member.medicalFiles.status.${status}`);

  const loadPersonalContext = useCallback(async (userId: string) => {
    try {
      const ctx = await buildPersonalContext(userId, { forceRefresh: true });
      setPersonalContext(ctx);
    } catch {
      setPersonalContext(null);
    }
  }, []);

  const persistStatusAdvances = useCallback(async (rows: MedicalFile[]) => {
    const updates: Promise<unknown>[] = [];
    for (const file of rows) {
      const meta = parseHealthRecordMetadata(file.metadata);
      const derived = deriveIntakeStatus(meta, file.upload_date);
      if (!shouldPersistStatusAdvance(meta.status, derived)) continue;
      const nextMeta = {
        ...meta,
        status: derived,
        statusUpdatedAt: new Date().toISOString(),
        insightsVersion: derived === 'insights_ready' ? '1' : meta.insightsVersion,
      };
      updates.push(
        supabase
          .from('medical_files')
          .update({ metadata: nextMeta })
          .eq('id', file.id)
          .then(() => undefined),
      );
      file.metadata = nextMeta;
    }
    if (updates.length) await Promise.all(updates);
  }, []);

  const loadFiles = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('medical_files')
        .select('*')
        .eq('user_id', user.user.id)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      const rows = (data || []) as MedicalFile[];
      await persistStatusAdvances(rows);
      setFiles(rows);
      clearMedicalFilesLocalMirror();
      await loadPersonalContext(user.user.id);
    } catch {
      notifyUserError(t('member.medicalFiles.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [loadPersonalContext, persistStatusAdvances, t]);

  useEffect(() => {
    clearMedicalFilesLocalMirror();
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    const id = window.setInterval(() => setStatusTick((n) => n + 1), 12_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!files.length) return;
    void persistStatusAdvances(files).then(() => {
      setFiles((prev) =>
        prev.map((file) => {
          const meta = parseHealthRecordMetadata(file.metadata);
          const derived = deriveIntakeStatus(meta, file.upload_date);
          if (meta.status === derived) return file;
          return {
            ...file,
            metadata: {
              ...meta,
              status: derived,
              statusUpdatedAt: new Date().toISOString(),
            },
          };
        }),
      );
    });
  }, [statusTick]); // eslint-disable-line react-hooks/exhaustive-deps -- tick-driven refresh

  const resetUploadForm = () => {
    setUploadForm({
      file_name: '',
      file_url: '',
      tags: '',
      selectedFile: null,
      source: 'upload',
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleFilePick = (
    event: React.ChangeEvent<HTMLInputElement>,
    source: 'upload' | 'camera',
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadForm((prev) => ({
      ...prev,
      selectedFile: file,
      file_name: prev.file_name || file.name,
      file_url: '',
      source,
    }));
  };

  const handleUpload = async () => {
    if (!uploadForm.file_name.trim()) {
      notifyUserInfo(t('member.medicalFiles.fileNameRequired'));
      return;
    }
    if (!uploadForm.selectedFile && !uploadForm.file_url.trim()) {
      notifyUserInfo(t('member.medicalFiles.fileOrUrlRequired'));
      return;
    }

    setUploading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        notifyUserError(t('member.medicalFiles.signInRequired'));
        return;
      }

      const tagsArray = uploadForm.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      let fileUrl = uploadForm.file_url.trim();
      let fileSize = 0;
      let fileType = intakeKind === 'raw_dna' ? 'raw_dna' : 'document';

      if (uploadForm.selectedFile) {
        fileSize = uploadForm.selectedFile.size;
        fileType = inferFileType(uploadForm.selectedFile, intakeKind);
        const upload = await uploadMedicalFileToStorage(uploadForm.selectedFile, user.user.id);
        if (upload.ok) {
          fileUrl =
            upload.signedUrl ||
            upload.publicFallbackUrl ||
            `storage://medical-files/${upload.path}`;
        } else if (!fileUrl) {
          fileUrl = `pending://${user.user.id}/${Date.now()}-${uploadForm.selectedFile.name}`;
          notifyUserInfo(t('member.medicalFiles.storageUnavailable'));
        }
      }

      const metadata = {
        intakeKind,
        status: 'received' as IntakeStatus,
        source: uploadForm.source,
        statusUpdatedAt: new Date().toISOString(),
      };

      const { error } = await supabase.from('medical_files').insert({
        user_id: user.user.id,
        file_name: uploadForm.file_name.trim(),
        file_url: fileUrl,
        file_type: fileType,
        file_size: fileSize,
        category: categoryForIntakeKind(intakeKind),
        tags: tagsArray,
        metadata,
      });

      if (error) throw error;

      invalidatePersonalContextCache(user.user.id);
      setShowUploadModal(false);
      resetUploadForm();
      await loadFiles();
      notifyUserSuccess(t('member.medicalFiles.uploadSuccess'));
    } catch {
      notifyUserError(t('member.medicalFiles.uploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('member.medicalFiles.deleteConfirm'))) return;

    try {
      const { error } = await supabase.from('medical_files').delete().eq('id', id);
      if (error) throw error;
      if (selectedFileId === id) setSelectedFileId(null);
      const { data: user } = await supabase.auth.getUser();
      if (user.user) invalidatePersonalContextCache(user.user.id);
      await loadFiles();
      notifyUserSuccess(t('member.medicalFiles.deleteSuccess'));
    } catch {
      notifyUserError(t('member.medicalFiles.deleteFailed'));
    }
  };

  const openResolved = async (file: MedicalFile) => {
    if (file.file_url.startsWith('pending://')) {
      notifyUserInfo(t('member.medicalFiles.pendingFile'));
      return;
    }
    const url = await resolveMedicalFileUrl(file.file_url);
    if (!url) {
      notifyUserInfo(t('member.medicalFiles.urlUnavailable'));
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareFile = (file: MedicalFile) => {
    notifyUserInfo(t('member.medicalFiles.shareNotice', { name: file.file_name }));
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return t('member.medicalFiles.sizeUnknown');
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  };

  const getFileIcon = (type: string) => {
    if (type === 'image') return <FileImage className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const fileStatus = (file: MedicalFile): IntakeStatus => {
    const meta = parseHealthRecordMetadata(file.metadata);
    return deriveIntakeStatus(meta, file.upload_date);
  };

  const fileKind = (file: MedicalFile): IntakeKind => {
    const meta = parseHealthRecordMetadata(file.metadata);
    return meta.intakeKind || intakeKindFromCategory(file.category, file.file_type);
  };

  const selectedFile = files.find((f) => f.id === selectedFileId) || null;
  const selectedStatus = selectedFile ? fileStatus(selectedFile) : null;
  const selectedKind = selectedFile ? fileKind(selectedFile) : null;

  const selectedInsights: HealthRecordInsights | null =
    selectedFile && selectedStatus === 'insights_ready' && selectedKind
      ? buildHealthRecordInsights({
          fileName: selectedFile.file_name,
          intakeKind: selectedKind,
          uploadDate: selectedFile.upload_date,
          personalContext,
          t,
        })
      : null;

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopyInsights = async () => {
    if (!selectedInsights) return;
    const ok = await copyReportText(selectedInsights.plainText);
    if (ok) notifyUserSuccess(t('member.medicalFiles.insights.copied'));
    else notifyUserError(t('member.medicalFiles.insights.copyFailed'));
  };

  const handleDownloadInsights = () => {
    if (!selectedInsights || !selectedFile) return;
    const safe = selectedFile.file_name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80);
    downloadReportTxt(`${safe}-insights`, selectedInsights.plainText);
    notifyUserSuccess(t('member.medicalFiles.insights.downloaded'));
  };

  const handlePrintInsights = () => {
    if (!selectedInsights || !insightsPrintRef.current) return;
    const markup = insightsPrintRef.current.innerHTML;
    const win = window.open('', '_blank', 'noopener,noreferrer,width=720,height=900');
    if (!win) {
      notifyUserInfo(t('member.medicalFiles.insights.printBlocked'));
      return;
    }
    win.document.write(`<!doctype html><html><head><title>${selectedInsights.title}</title>
      <style>
        body { font-family: Georgia, 'Times New Roman', serif; color: #111; padding: 32px; line-height: 1.5; }
        h1 { font-size: 1.4rem; margin: 0 0 1rem; }
        h2 { font-size: 1.05rem; margin: 1.25rem 0 0.5rem; }
        p, li { font-size: 0.95rem; }
        .disclaimer { margin-top: 1.5rem; font-size: 0.85rem; color: #444; }
      </style></head><body>${markup}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  const handleShareInsights = async () => {
    if (!selectedInsights) return;
    const result = await shareReportContent({
      title: selectedInsights.title,
      text: selectedInsights.plainText,
    });
    if (result === 'shared') notifyUserSuccess(t('member.medicalFiles.insights.shared'));
    else if (result === 'copied') notifyUserSuccess(t('member.medicalFiles.insights.copied'));
    else if (result === 'failed') notifyUserError(t('member.medicalFiles.insights.shareFailed'));
  };

  const handleAskHealthGuide = () => {
    if (!selectedFile || !selectedKind) return;
    const prompt = buildRecordHealthGuidePrompt({
      intakeKind: selectedKind,
      fileName: selectedFile.file_name,
      personalContext,
      t,
    });
    openHealthGuideWithPrompt(prompt);
  };

  const steps = [
    t('member.medicalFiles.steps.upload'),
    t('member.medicalFiles.steps.structure'),
    t('member.medicalFiles.steps.insights'),
    t('member.medicalFiles.steps.use'),
  ];

  return (
    <div className="space-y-6">
      <div className="member-card p-5">
        <p className="text-sm member-body leading-relaxed">{t('member.medicalFiles.hubIntro')}</p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((label, index) => (
            <li
              key={label}
              className="member-inset rounded-xl px-3 py-3 text-sm member-body flex gap-2 items-start"
            >
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 text-xs font-semibold">
                {index + 1}
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="p-4 member-inset rounded-2xl border border-amber-200/80 dark:border-amber-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm member-heading mb-1">{t('member.medicalFiles.legalNotice')}</p>
            <p className="text-xs member-muted">{t('member.medicalFiles.legalNoticeBody')}</p>
            <p className="text-xs member-muted mt-2">{t('member.medicalFiles.privacyNote')}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {INTAKE_KINDS.map((kind) => {
            const active = intakeKind === kind;
            return (
              <button
                key={kind}
                type="button"
                onClick={() => setIntakeKind(kind)}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg border transition-colors ${
                  active
                    ? 'border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300'
                    : 'border-[var(--bm-border)] member-muted hover:member-body'
                }`}
              >
                {t(`member.medicalFiles.intakeKinds.${kind}`)}
              </button>
            );
          })}
        </div>
        <p className="text-xs member-muted">{t('member.medicalFiles.formatsHint')}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 member-muted" />
          <label className="sr-only" htmlFor="medical-files-search">
            {t('member.medicalFiles.searchPlaceholder')}
          </label>
          <input
            id="medical-files-search"
            type="search"
            placeholder={t('member.medicalFiles.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 member-input"
            aria-label={t('member.medicalFiles.searchPlaceholder')}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="medical-files-category-filter">
            {t('member.medicalFiles.category')}
          </label>
          <select
            id="medical-files-category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 member-input"
            aria-label={t('member.medicalFiles.category')}
          >
            <option value="all">{t('member.medicalFiles.allCategories')}</option>
            {CATEGORY_KEYS.map((key) => (
              <option key={key} value={key}>
                {categoryLabel(key)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setShowUploadModal(true);
              setUploadForm((prev) => ({ ...prev, source: 'upload' }));
            }}
            className="px-5 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all flex items-center gap-2"
          >
            <Upload className="h-5 w-5" />
            {t('member.medicalFiles.uploadFile')}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowUploadModal(true);
              setTimeout(() => cameraInputRef.current?.click(), 0);
            }}
            className="px-5 py-3 member-btn flex items-center gap-2"
          >
            <Camera className="h-5 w-5" />
            {t('member.medicalFiles.scanCapture')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          <p className="text-sm member-muted">{t('member.medicalFiles.loading')}</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12 member-card">
          <FileText className="h-16 w-16 member-muted mx-auto mb-4" />
          <p className="member-body mb-2">{t('member.medicalFiles.empty')}</p>
          <p className="text-sm member-muted">{t('member.medicalFiles.emptyHint')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredFiles.map((file) => {
            const status = fileStatus(file);
            const StatusIcon = STATUS_ICON[status];
            const active = selectedFileId === file.id;
            return (
              <div
                key={file.id}
                className={`member-card p-4 shadow-lg transition-all ${
                  active
                    ? 'border-orange-500/50 ring-1 ring-orange-500/30'
                    : 'hover:border-orange-500/30'
                }`}
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => setSelectedFileId(file.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-600/30 rounded-lg">
                      {getFileIcon(file.file_type)}
                    </div>
                    <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                      {categoryLabel(file.category)}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold member-heading mb-2 line-clamp-2">
                    {file.file_name}
                  </h3>

                  <div className="flex items-center gap-2 text-xs member-muted mb-3">
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>•</span>
                    <span>{new Date(file.upload_date).toLocaleDateString(i18n.language)}</span>
                  </div>

                  <div
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs mb-3 ${
                      status === 'insights_ready'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-600/30'
                        : status === 'in_review'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-600/30'
                          : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-[var(--bm-surface)] dark:text-neutral-300 dark:border-[var(--bm-border)]'
                    }`}
                  >
                    <StatusIcon
                      className={`h-3.5 w-3.5 ${status === 'in_review' ? 'animate-spin' : ''}`}
                    />
                    {statusLabel(status)}
                  </div>
                </button>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      icon: Download,
                      handler: () => openResolved(file),
                      label: t('member.medicalFiles.download'),
                      color: 'text-blue-600',
                    },
                    {
                      icon: Share2,
                      handler: () => handleShareFile(file),
                      label: t('member.medicalFiles.share'),
                      color: 'text-emerald-600',
                    },
                    {
                      icon: Printer,
                      handler: () => openResolved(file),
                      label: t('member.medicalFiles.print'),
                      color: 'text-purple-600',
                    },
                    {
                      icon: Eye,
                      handler: () => setSelectedFileId(file.id),
                      label: t('member.common.view'),
                      color: 'text-orange-500',
                    },
                    {
                      icon: Sparkles,
                      handler: () => setSelectedFileId(file.id),
                      label: t('member.medicalFiles.viewInsights'),
                      color: 'text-orange-500',
                    },
                    {
                      icon: Trash2,
                      handler: () => handleDelete(file.id),
                      label: t('member.common.delete'),
                      color: 'text-red-500',
                      danger: true,
                    },
                  ].map(({ icon: Icon, handler, label, color, danger }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={handler}
                      className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                        danger
                          ? 'bg-slate-100 hover:bg-red-100 dark:bg-[var(--bm-surface)] dark:hover:bg-red-900/30'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-[var(--bm-surface)] dark:hover:bg-[var(--bm-elevated)]'
                      }`}
                      title={label}
                      aria-label={label}
                    >
                      <Icon className={`h-4 w-4 ${color}`} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedFile && (
        <div className="member-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-orange-600 dark:text-orange-400 font-semibold">
                {t('member.medicalFiles.insights.panelLabel')}
              </p>
              <h3 className="text-lg font-semibold member-heading mt-1">{selectedFile.file_name}</h3>
              <p className="text-sm member-muted mt-1">
                {categoryLabel(selectedFile.category)} · {statusLabel(selectedStatus || 'received')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAskHealthGuide}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 text-white text-sm"
            >
              <Mic className="h-4 w-4" />
              {t('member.medicalFiles.askHealthGuide')}
            </button>
          </div>

          {selectedStatus !== 'insights_ready' || !selectedInsights ? (
            <div className="member-inset rounded-xl p-4 text-sm member-body">
              <p>{t('member.medicalFiles.insights.pendingBody')}</p>
              <p className="text-xs member-muted mt-2">
                {t('member.medicalFiles.insights.pendingHint')}
              </p>
            </div>
          ) : (
            <>
              <div ref={insightsPrintRef} className="space-y-4">
                <h1 className="text-xl font-semibold member-heading">{selectedInsights.title}</h1>
                <div>
                  <h2 className="text-sm font-semibold member-heading mb-1">
                    {t('member.medicalFiles.insights.sectionExplanation')}
                  </h2>
                  <p className="text-sm member-body leading-relaxed">{selectedInsights.explanation}</p>
                </div>
                <div>
                  <h2 className="text-sm font-semibold member-heading mb-1">
                    {t('member.medicalFiles.insights.sectionConclusions')}
                  </h2>
                  <ul className="list-disc pl-5 space-y-1 text-sm member-body">
                    {selectedInsights.conclusions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="text-sm font-semibold member-heading mb-1">
                    {t('member.medicalFiles.insights.sectionRecommendations')}
                  </h2>
                  <ul className="list-disc pl-5 space-y-1 text-sm member-body">
                    {selectedInsights.recommendations.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <p className="disclaimer text-xs member-muted border-t border-[var(--bm-border)] pt-3">
                  {selectedInsights.disclaimer}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={handleCopyInsights} className="member-btn inline-flex items-center gap-2 px-3 py-2 text-sm">
                  <Copy className="h-4 w-4" />
                  {t('member.medicalFiles.insights.copy')}
                </button>
                <button type="button" onClick={handlePrintInsights} className="member-btn inline-flex items-center gap-2 px-3 py-2 text-sm">
                  <Printer className="h-4 w-4" />
                  {t('member.medicalFiles.insights.print')}
                </button>
                <button type="button" onClick={handleDownloadInsights} className="member-btn inline-flex items-center gap-2 px-3 py-2 text-sm">
                  <Download className="h-4 w-4" />
                  {t('member.medicalFiles.insights.downloadTxt')}
                </button>
                <button type="button" onClick={handleShareInsights} className="member-btn inline-flex items-center gap-2 px-3 py-2 text-sm">
                  <Share2 className="h-4 w-4" />
                  {t('member.medicalFiles.insights.share')}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {showUploadModal && (
        <ModalShell
          title={t('member.medicalFiles.uploadTitle')}
          onClose={() => {
            setShowUploadModal(false);
            resetUploadForm();
          }}
          panelClassName="max-w-md"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium member-body mb-2">
                {t('member.medicalFiles.intakeKindLabel')}
              </p>
              <div className="flex flex-wrap gap-2">
                {INTAKE_KINDS.map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => setIntakeKind(kind)}
                    className={`px-3 py-1.5 text-xs rounded-lg border ${
                      intakeKind === kind
                        ? 'border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300'
                        : 'border-[var(--bm-border)] member-muted'
                    }`}
                  >
                    {t(`member.medicalFiles.intakeKinds.${kind}`)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium member-body mb-2" htmlFor="mf-file">
                {t('member.medicalFiles.chooseFile')}
              </label>
              <input
                id="mf-file"
                ref={fileInputRef}
                type="file"
                onChange={(e) => handleFilePick(e, 'upload')}
                className="w-full text-sm member-body"
                accept={ACCEPT_UPLOAD}
              />
              <p className="mt-1 text-xs member-muted">{t('member.medicalFiles.chooseFileHint')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium member-body mb-2" htmlFor="mf-camera">
                {t('member.medicalFiles.scanCapture')}
              </label>
              <input
                id="mf-camera"
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFilePick(e, 'camera')}
                className="w-full text-sm member-body"
              />
              <p className="mt-1 text-xs member-muted">{t('member.medicalFiles.scanCaptureHint')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium member-body mb-2" htmlFor="mf-name">
                {t('member.medicalFiles.fileName')}
              </label>
              <input
                id="mf-name"
                type="text"
                value={uploadForm.file_name}
                onChange={(e) => setUploadForm({ ...uploadForm, file_name: e.target.value })}
                className="w-full px-4 py-2 member-input"
                placeholder={t('member.medicalFiles.fileNamePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium member-body mb-2" htmlFor="mf-url">
                {t('member.medicalFiles.fileUrlOptional')}
              </label>
              <input
                id="mf-url"
                type="url"
                value={uploadForm.file_url}
                onChange={(e) => setUploadForm({ ...uploadForm, file_url: e.target.value })}
                className="w-full px-4 py-2 member-input"
                placeholder={t('member.medicalFiles.fileUrlPlaceholder')}
              />
              <p className="mt-1 text-xs member-muted">{t('member.medicalFiles.fileUrlHint')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium member-body mb-2" htmlFor="mf-tags">
                {t('member.medicalFiles.tagsLabel')}
              </label>
              <input
                id="mf-tags"
                type="text"
                value={uploadForm.tags}
                onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                className="w-full px-4 py-2 member-input"
                placeholder={t('member.medicalFiles.tagsPlaceholder')}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all disabled:opacity-50"
            >
              {uploading ? t('member.medicalFiles.uploading') : t('member.common.upload')}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUploadModal(false);
                resetUploadForm();
              }}
              className="px-6 py-2 bg-slate-200 dark:bg-gray-800 member-body rounded-lg hover:bg-slate-300 dark:hover:bg-gray-700 transition-colors"
            >
              {t('member.common.cancel')}
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
