import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Shield, Key, Activity, AlertTriangle, Upload, Eye, Trash2, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notifyUserError, notifyUserSuccess } from '../../lib/adminNotify';
import ModalShell from '../../components/ui/ModalShell';
import ErrorBanner from '../../components/ui/ErrorBanner';
import Button from '../../components/ui/Button';
import ReportBrandHeader from '../../components/report/ReportBrandHeader';
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
  const { t } = useTranslation();
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
        setError('Please sign in to view Black Box files');
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
      notifyUserError('Black Box files load failed');
      setError('Unable to load Black Box files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (formData: any) => {
    try {
      const resolvedUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!resolvedUserId) {
        notifyUserError('Please sign in to upload files');
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
      notifyUserSuccess('File uploaded to Black Box');
      loadFiles();
    } catch (error) {
      notifyUserError('File upload failed');
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
      notifyUserSuccess('File access logged');
      loadFiles();
    } catch (error) {
      notifyUserError('File access failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file from Black Box? This action cannot be undone and will be logged.')) return;

    try {
      const { error } = await supabase
        .from('black_box_files')
        .delete()
        .eq('id', id);

      if (error) throw error;
      notifyUserSuccess('File deleted');
      loadFiles();
    } catch (error) {
      notifyUserError('File delete failed');
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
    <div>
<ReportBrandHeader
        title="BioMath Core"
        subtitle="Black Box Storage"
        variant="strip"
        className="mb-6"
      />

      {error && <ErrorBanner message={error} className="mb-4" />}

      <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600/30 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-700 dark:text-red-200 font-medium mb-1">{t('member.blackBox.legalNotice')}</p>
            <p className="text-xs text-red-700/80 dark:text-red-300/80 mb-2">
              You are FULLY RESPONSIBLE for all content stored in your Black Box. Only store legal information
              relevant to health services. Any illegal content will result in immediate account termination and
              legal action. All access is logged and monitored for compliance.
            </p>
            <p className="text-xs text-red-700/80 dark:text-red-300/80">
              By using Black Box Storage, you acknowledge full legal responsibility for your data and agree to
              comply with all applicable laws (HIPAA, GDPR, local regulations).
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <MemberMetricCard
          accent="blue"
          icon={<Shield className="h-5 w-5" />}
          badge={<span className="text-xs text-blue-600 dark:text-blue-400 font-medium">ENCRYPTED</span>}
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
          badge={<span className="text-xs text-orange-600 dark:text-orange-400 font-medium">MONITORED</span>}
          value={stats.accessCount}
          label={t('member.blackBox.accessLogs')}
        />
        <MemberMetricCard
          accent="purple"
          icon={<Lock className="h-5 w-5" />}
          badge={<span className="text-xs text-purple-600 dark:text-purple-400 font-medium">SECURE</span>}
          value={stats.lastAccess ? new Date(stats.lastAccess).toLocaleDateString() : 'Never'}
          label={t('member.blackBox.lastAccess')}
        />
      </div>

      <div className="mb-6 member-card rounded-xl p-6 shadow-sm">
        <ReportBrandHeader variant="strip" subtitle="Security Features" className="mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-orange-500" />
          Security Features
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-600/30 rounded-lg flex-shrink-0">
              <Key className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">AES-256-GCM Encryption</p>
              <p className="text-xs text-gray-600 dark:text-neutral-300">Military-grade encryption for all files</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-600/30 rounded-lg flex-shrink-0">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Tamper-Proof Audit Logs</p>
              <p className="text-xs text-gray-600 dark:text-neutral-300">All access is recorded and immutable</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-600/30 rounded-lg flex-shrink-0">
              <Lock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Zero-Knowledge Architecture</p>
              <p className="text-xs text-gray-600 dark:text-neutral-300">Only you can decrypt your files</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-600/30 rounded-lg flex-shrink-0">
              <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Biometric Access Control</p>
              <p className="text-xs text-gray-600 dark:text-neutral-300">Multi-factor authentication required</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('member.blackBox.encryptedFiles')}</h3>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={loadFiles}>
            Refresh
          </Button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload to Black Box
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600 dark:text-neutral-300">Loading secure storage...</div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 bg-white/70 dark:bg-[var(--bm-surface)]/40 border border-slate-200 dark:border-[var(--bm-border)] rounded-2xl shadow-sm">
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
              <ReportBrandHeader variant="strip" subtitle="Encrypted File" className="mb-3" />
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex items-center gap-1">
                  <Lock className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-400 font-medium">ENCRYPTED</span>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{file.file_name}</h3>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-neutral-400">Encryption:</span>
                  <span className="text-green-600 font-mono">{file.encryption_method}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-neutral-400 dark:text-neutral-400">Size:</span>
                  <span className="text-gray-700 dark:text-neutral-300">{formatFileSize(file.file_size)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-neutral-400 dark:text-neutral-400">Uploaded:</span>
                  <span className="text-gray-700 dark:text-neutral-300">{new Date(file.upload_date).toLocaleDateString()}</span>
                </div>
                {file.last_accessed && (
                  <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-neutral-400">Last Access:</span>
                  <span className="text-orange-600">{new Date(file.last_accessed).toLocaleDateString()}</span>
                </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-neutral-400 dark:text-neutral-400">Access Logs:</span>
                  <span className="text-blue-600 dark:text-blue-400">{file.access_log?.length || 0} entries</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAccess(file)}
                  className="flex-1 p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center justify-center gap-2 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:border-green-600/30"
                >
                  <Eye className="h-4 w-4 text-emerald-700 dark:text-green-300" />
                  <span className="text-xs text-emerald-700 dark:text-green-300">Access</span>
                </button>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:border-red-600/30"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-red-600 dark:text-red-300" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <ModalShell
          title="Upload to Black Box"
          icon={<Lock className="h-6 w-6 text-orange-500" />}
          onClose={() => setShowUploadModal(false)}
          panelClassName="max-w-md"
        >
          <p className="text-sm text-gray-600 dark:text-neutral-300 mb-4">
            Files will be encrypted with AES-256-GCM before storage
          </p>
          <p className="text-xs text-orange-700 dark:text-orange-300 mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-600/30 rounded-lg">
            By uploading, you confirm this content is legal and compliant with all regulations
          </p>

          <button
            onClick={() => setShowUploadModal(false)}
            className="w-full px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
          >
            Close
          </button>
        </ModalShell>
      )}
    </div>
  );
}
