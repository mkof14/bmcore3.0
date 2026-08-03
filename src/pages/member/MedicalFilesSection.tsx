import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Upload, Download, Share2, Printer, Copy, Trash2, Eye, Search, FileImage, FileVideo, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notifyUserError, notifyUserInfo, notifyUserSuccess } from '../../lib/adminNotify';
import ModalShell from '../../components/ui/ModalShell';

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
}

const CATEGORIES = ['Lab Results', 'X-Ray', 'MRI', 'CT Scan', 'Prescription', 'Report', 'Other'];
const FILE_TYPES = ['pdf', 'image', 'document', 'video', 'dicom'];

export default function MedicalFilesSection() {
  const { t, i18n } = useTranslation();
  const [files, setFiles] = useState<MedicalFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploadForm, setUploadForm] = useState({
    file_name: '',
    file_url: '',
    file_type: 'pdf',
    category: 'Lab Results',
    tags: '',
  });

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('medical_files')
        .select('*')
        .eq('user_id', user.user.id)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
      try {
        localStorage.setItem('bmcore.medical.files', JSON.stringify(data || []));
      } catch {
        // ignore
      }
    } catch (error) {
      notifyUserError(t('member.medicalFiles.loading'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file_name || !uploadForm.file_url) {
      notifyUserInfo(t('member.medicalFiles.fileName'));
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const tagsArray = uploadForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      const { error } = await supabase
        .from('medical_files')
        .insert({
          user_id: user.user.id,
          file_name: uploadForm.file_name,
          file_url: uploadForm.file_url,
          file_type: uploadForm.file_type,
          file_size: 0,
          category: uploadForm.category,
          tags: tagsArray,
        });

      if (error) throw error;

      setShowUploadModal(false);
      setUploadForm({
        file_name: '',
        file_url: '',
        file_type: 'pdf',
        category: 'Lab Results',
        tags: '',
      });
      loadFiles();
      notifyUserSuccess(t('member.common.upload'));
    } catch (error) {
      notifyUserError(t('member.common.upload'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('member.medicalFiles.deleteConfirm'))) return;

    try {
      const { error } = await supabase
        .from('medical_files')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadFiles();
      notifyUserSuccess(t('member.common.delete'));
    } catch (error) {
      notifyUserError(t('member.common.delete'));
    }
  };

  const handleCopy = (file: MedicalFile) => {
    navigator.clipboard.writeText(file.file_url);
    notifyUserInfo(t('member.medicalFiles.copyUrl'));
  };

  const handleShare = (file: MedicalFile) => {
    notifyUserInfo(`${t('member.medicalFiles.share')}: "${file.file_name}"`);
  };

  const handlePrint = (file: MedicalFile) => {
    window.open(file.file_url, '_blank');
  };

  const handleDownload = (file: MedicalFile) => {
    window.open(file.file_url, '_blank');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <FileImage className="h-5 w-5" />;
      case 'video': return <FileVideo className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-600/30 rounded-2xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium mb-1">{t('member.medicalFiles.legalNotice')}</p>
            <p className="text-xs text-yellow-700/80 dark:text-yellow-300/80 member-body">
              {t('member.medicalFiles.legalNoticeBody')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 member-muted" />
          <input
            type="text"
            placeholder={t('member.medicalFiles.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 member-input"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 member-input"
          >
            <option value="all">{t('member.medicalFiles.allCategories')}</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all flex items-center gap-2"
          >
            <Upload className="h-5 w-5" />
            {t('member.medicalFiles.uploadFile')}
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="member-card p-4 shadow-lg hover:border-orange-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-600/30 rounded-lg">
                  {getFileIcon(file.file_type)}
                </div>
                <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                  {file.category}
                </span>
              </div>

              <h3 className="text-sm font-semibold member-heading mb-2 line-clamp-2">{file.file_name}</h3>

              <div className="flex items-center gap-2 text-xs member-muted mb-3">
                <span>{formatFileSize(file.file_size)}</span>
                <span>•</span>
                <span>{new Date(file.upload_date).toLocaleDateString(i18n.language)}</span>
              </div>

              {file.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {file.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-[var(--bm-surface)] member-muted text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Download, handler: () => handleDownload(file), label: t('member.medicalFiles.download'), color: 'text-blue-600' },
                  { icon: Share2, handler: () => handleShare(file), label: t('member.medicalFiles.share'), color: 'text-emerald-600' },
                  { icon: Printer, handler: () => handlePrint(file), label: t('member.medicalFiles.print'), color: 'text-purple-600' },
                  { icon: Copy, handler: () => handleCopy(file), label: t('member.medicalFiles.copyUrl'), color: 'text-yellow-600' },
                  { icon: Eye, handler: () => window.open(file.file_url, '_blank'), label: t('member.common.view'), color: 'text-orange-500' },
                  { icon: Trash2, handler: () => handleDelete(file.id), label: t('member.common.delete'), color: 'text-red-500', danger: true },
                ].map(({ icon: Icon, handler, label, color, danger }) => (
                  <button
                    key={label}
                    onClick={handler}
                    className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                      danger ? 'bg-slate-100 hover:bg-red-100 dark:bg-[var(--bm-surface)] dark:hover:bg-red-900/30' : 'bg-slate-100 hover:bg-slate-200 dark:bg-[var(--bm-surface)] dark:hover:bg-[var(--bm-elevated)]'
                    }`}
                    title={label}
                  >
                    <Icon className={`h-4 w-4 ${color}`} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <ModalShell
          title={t('member.medicalFiles.uploadTitle')}
          onClose={() => setShowUploadModal(false)}
          panelClassName="max-w-md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium member-body mb-2">{t('member.medicalFiles.fileName')}</label>
              <input
                type="text"
                value={uploadForm.file_name}
                onChange={(e) => setUploadForm({ ...uploadForm, file_name: e.target.value })}
                className="w-full px-4 py-2 member-input"
                placeholder={t('member.medicalFiles.fileNamePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium member-body mb-2">{t('member.medicalFiles.fileUrl')}</label>
              <input
                type="text"
                value={uploadForm.file_url}
                onChange={(e) => setUploadForm({ ...uploadForm, file_url: e.target.value })}
                className="w-full px-4 py-2 member-input"
                placeholder={t('member.medicalFiles.fileUrlPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium member-body mb-2">{t('member.medicalFiles.category')}</label>
              <select
                value={uploadForm.category}
                onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                className="w-full px-4 py-2 member-input"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium member-body mb-2">{t('member.medicalFiles.fileType')}</label>
              <select
                value={uploadForm.file_type}
                onChange={(e) => setUploadForm({ ...uploadForm, file_type: e.target.value })}
                className="w-full px-4 py-2 member-input"
              >
                {FILE_TYPES.map(type => (
                  <option key={type} value={type}>{type.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium member-body mb-2">{t('member.medicalFiles.tagsLabel')}</label>
              <input
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
              onClick={handleUpload}
              className="flex-1 px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all"
            >
              {t('member.common.upload')}
            </button>
            <button
              onClick={() => setShowUploadModal(false)}
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
