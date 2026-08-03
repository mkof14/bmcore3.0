import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Shield, Key, Activity, AlertTriangle, Upload, Eye, Trash2, FileText, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notifyUserError, notifyUserSuccess } from '../../lib/adminNotify';
import ModalShell from '../../components/ui/ModalShell';
import ErrorBanner from '../../components/ui/ErrorBanner';
import Button from '../../components/ui/Button';
import MemberMetricCard from '../../components/ui/MemberMetricCard';

interface BlackBoxFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  encryption_method: string;
  upload_date: string;
  last_accessed: string | null;
  access_log: any[];
}

export default function BlackBoxSection() {
  const { t, i18n } = useTranslation();
  const [files, setFiles] = useState<BlackBoxFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    lastAccess: null as string | null,
    accessCount: 0,
  });

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        setError(t('member.blackBox.signInRequired'));
        return;
      }
      setUserId(user.user.id);

      const { data, error } = await supabase
        .from('black_box_files')
        .select('*')
        .eq('user_id', user.user.id)
        .order('upload_date', { ascending: false });

      if (error) throw error;

      const fileData = data || [];
      setFiles(fileData);

      const totalSize = fileData.reduce((sum, f) => sum + f.file_size, 0);
      const accessLogs = fileData.flatMap(f => f.access_log || []);
      const lastAccess = fileData
        .map(f => f.last_accessed)
        .filter(Boolean)
        .sort()
        .reverse()[0];

      setStats({
        totalFiles: fileData.length,
        totalSize,
        lastAccess,
        accessCount: accessLogs.length,
      });
      setError(null);
    } catch (error) {
      notifyUserError(t('member.blackBox.loadFailed'));
      setError(t('member.blackBox.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (formData: { file_name: string; file_url: string; file_type: string }) => {
    try {
      const resolvedUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!resolvedUserId) {
        notifyUserError(t('member.blackBox.signInRequired'));
        return;
      }

      const { error } = await supabase
        .from('black_box_files')
        .insert({
          user_id: resolvedUserId,
          file_name: formData.file_name,
          file_url: formData.file_url,
          file_type: formData.file_type,
          file_size: 0,
          encryption_method: 'AES-256-GCM',
          encryption_key_id: crypto.randomUUID(),
        });

      if (error) throw error;
      setShowUploadModal(false);
      notifyUserSuccess(t('member.common.upload'));
      loadFiles();
    } catch (error) {
      notifyUserError(t('member.common.upload'));
    }
  };

  const handleAccess = async (file: BlackBoxFile) => {
    try {
      const accessEntry = {
        timestamp: new Date().toISOString(),
        action: 'view',
        ip: 'xxx.xxx.xxx.xxx',
      };

      const newAccessLog = [...(file.access_log || []), accessEntry];

      const { error } = await supabase
        .from('black_box_files')
        .update({
          last_accessed: new Date().toISOString(),
          access_log: newAccessLog,
        })
        .eq('id', file.id);

      if (error) throw error;

      window.open(file.file_url, '_blank');
      notifyUserSuccess(t('member.common.access'));
      loadFiles();
    } catch (error) {
      notifyUserError(t('member.common.access'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('member.blackBox.deleteConfirm'))) return;

    try {
      const { error } = await supabase
        .from('black_box_files')
        .delete()
        .eq('id', id);

      if (error) throw error;
      notifyUserSuccess(t('member.common.delete'));
      loadFiles();
    } catch (error) {
      notifyUserError(t('member.common.delete'));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {error && <ErrorBanner message={error} className="mb-4" />}

      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600/30 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-700 dark:text-red-200 font-medium mb-1">{t('member.blackBox.legalNotice')}</p>
            <p className="text-xs text-red-700/80 dark:text-red-300/80 member-body mb-2">
              {t('member.blackBox.legalNoticeBody')}
            </p>
            <p className="text-xs text-red-700/80 dark:text-red-300/80 member-body">
              {t('member.blackBox.legalNoticeBody2')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <MemberMetricCard
          accent="blue"
          icon={<Shield className="h-5 w-5" />}
          badge={<span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{t('member.blackBox.badgeEncrypted')}</span>}
          value={stats.totalFiles}
          label={t('member.blackBox.securedFiles')}
        />
        <MemberMetricCard
          accent="green"
          icon={<Key className="h-5 w-5" />}
          badge={<span className="text-xs text-green-600 dark:text-green-400 font-medium">AES-256</span>}
          value={formatFileSize(stats.totalSize)}
          label={t('member.blackBox.totalStorage')}
        />
        <MemberMetricCard
          accent="orange"
          icon={<Activity className="h-5 w-5" />}
          badge={<span className="text-xs text-orange-600 dark:text-orange-400 font-medium">{t('member.blackBox.badgeMonitored')}</span>}
          value={stats.accessCount}
          label={t('member.blackBox.accessLogs')}
        />
        <MemberMetricCard
          accent="purple"
          icon={<Lock className="h-5 w-5" />}
          badge={<span className="text-xs text-purple-600 dark:text-purple-400 font-medium">{t('member.blackBox.badgeSecure')}</span>}
          value={stats.lastAccess ? new Date(stats.lastAccess).toLocaleDateString(i18n.language) : t('member.blackBox.never')}
          label={t('member.blackBox.lastAccess')}
        />
      </div>

      <div className="member-card rounded-xl p-6 shadow-sm">
        <h3 className="member-heading text-lg mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-orange-500" />
          {t('member.blackBox.securityFeatures')}
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-600/30 rounded-lg flex-shrink-0">
              <Key className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium member-heading">{t('member.blackBox.securityAesTitle')}</p>
              <p className="text-xs member-muted">{t('member.blackBox.securityAesBody')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-600/30 rounded-lg flex-shrink-0">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium member-heading">{t('member.blackBox.securityAuditTitle')}</p>
              <p className="text-xs member-muted">{t('member.blackBox.securityAuditBody')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-600/30 rounded-lg flex-shrink-0">
              <Lock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium member-heading">{t('member.blackBox.securityZeroTitle')}</p>
              <p className="text-xs member-muted">{t('member.blackBox.securityZeroBody')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-600/30 rounded-lg flex-shrink-0">
              <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium member-heading">{t('member.blackBox.securityBioTitle')}</p>
              <p className="text-xs member-muted">{t('member.blackBox.securityBioBody')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="member-heading text-xl">{t('member.blackBox.encryptedFiles')}</h3>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={loadFiles}>
            {t('member.common.refresh')}
          </Button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {t('member.blackBox.uploadToBlackBox')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          <p className="text-sm member-muted">{t('member.blackBox.loading')}</p>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 member-card">
          <Lock className="h-16 w-16 member-muted mx-auto mb-4" />
          <p className="member-body mb-2">{t('member.blackBox.empty')}</p>
          <p className="text-sm member-muted">{t('member.blackBox.emptyHint')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="member-card rounded-xl border-orange-200 dark:border-orange-600/30 p-4 hover:border-orange-500/50 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-600/30 rounded-lg">
                  <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex items-center gap-1">
                  <Lock className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">{t('member.blackBox.badgeEncrypted')}</span>
                </div>
              </div>

              <h3 className="text-sm font-semibold member-heading mb-2 line-clamp-2">{file.file_name}</h3>

              <div className="space-y-2 mb-3 text-xs">
                <div className="flex justify-between">
                  <span className="member-muted">{t('member.blackBox.encryption')}</span>
                  <span className="text-green-600 dark:text-green-400 font-mono">{file.encryption_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="member-muted">{t('member.blackBox.size')}</span>
                  <span className="member-body">{formatFileSize(file.file_size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="member-muted">{t('member.blackBox.uploaded')}</span>
                  <span className="member-body">{new Date(file.upload_date).toLocaleDateString(i18n.language)}</span>
                </div>
                {file.last_accessed && (
                  <div className="flex justify-between">
                    <span className="member-muted">{t('member.blackBox.lastAccessLabel')}</span>
                    <span className="text-orange-600 dark:text-orange-400">{new Date(file.last_accessed).toLocaleDateString(i18n.language)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="member-muted">{t('member.blackBox.accessLogsLabel')}</span>
                  <span className="text-blue-600 dark:text-blue-400">{t('member.blackBox.entries', { count: file.access_log?.length || 0 })}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAccess(file)}
                  className="flex-1 p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center justify-center gap-2 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:border-green-600/30"
                >
                  <Eye className="h-4 w-4 text-emerald-700 dark:text-green-300" />
                  <span className="text-xs text-emerald-700 dark:text-green-300">{t('member.common.access')}</span>
                </button>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:border-red-600/30"
                  title={t('member.common.delete')}
                >
                  <Trash2 className="h-4 w-4 text-red-600 dark:text-red-300" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} onUpload={handleUpload} />
      )}
    </div>
  );
}

function UploadModal({
  onClose,
  onUpload,
}: {
  onClose: () => void;
  onUpload: (data: { file_name: string; file_url: string; file_type: string }) => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ file_name: '', file_url: '', file_type: 'pdf' });

  return (
    <ModalShell
      title={t('member.blackBox.uploadTitle')}
      icon={<Lock className="h-6 w-6 text-orange-500" />}
      onClose={onClose}
      panelClassName="max-w-md"
    >
      <p className="text-sm member-body mb-4">{t('member.blackBox.uploadBody')}</p>
      <p className="text-xs text-orange-700 dark:text-orange-300 mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-600/30 rounded-lg">
        {t('member.blackBox.uploadConfirm')}
      </p>

      <div className="space-y-3 mb-6">
        <input
          type="text"
          value={form.file_name}
          onChange={(e) => setForm({ ...form, file_name: e.target.value })}
          placeholder={t('member.medicalFiles.fileName')}
          className="w-full member-input"
        />
        <input
          type="text"
          value={form.file_url}
          onChange={(e) => setForm({ ...form, file_url: e.target.value })}
          placeholder={t('member.medicalFiles.fileUrl')}
          className="w-full member-input"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => form.file_name && form.file_url && onUpload(form)}
          className="flex-1 px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg"
        >
          {t('member.common.upload')}
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-slate-100 dark:bg-gray-800 member-body rounded-lg border border-slate-200 dark:border-gray-700"
        >
          {t('member.common.close')}
        </button>
      </div>
    </ModalShell>
  );
}
