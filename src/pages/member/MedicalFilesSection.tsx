import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Upload, Download, Share2, Printer, Copy, Trash2, Eye, Search, FileImage, FileVideo, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notifyUserError, notifyUserInfo, notifyUserSuccess } from '../../lib/adminNotify';
import ModalShell from '../../components/ui/ModalShell';
import ReportBrandHeader from '../../components/report/ReportBrandHeader';

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
  const { t } = useTranslation();
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
      notifyUserError('Medical files load failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file_name || !uploadForm.file_url) {
      notifyUserInfo('File name and URL are required');
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const tagsArray = uploadForm.tags.split(',').map(t => t.trim()).filter(t => t);

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
      notifyUserSuccess('File uploaded');
    } catch (error) {
      notifyUserError('File upload failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('medical_files')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadFiles();
      notifyUserSuccess('File deleted');
    } catch (error) {
      notifyUserError('File delete failed');
    }
  };

  const handleCopy = (file: MedicalFile) => {
    navigator.clipboard.writeText(file.file_url);
    notifyUserInfo('File URL copied');
  };

  const handleShare = (file: MedicalFile) => {
    notifyUserInfo(`Share link not available: "${file.file_name}"`);
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
    <div>
<ReportBrandHeader
        title="BioMath Core"
        subtitle="Medical Records Vault"
        variant="strip"
        className="mb-6"
      />

      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-700 font-medium mb-1">{t('member.medicalFiles.legalNotice')}</p>
            <p className="text-xs text-yellow-700/80">
              Only store legal medical documents relevant to health services. You are fully responsible for the content
              of your files and any legal consequences related to storing personal health information. Ensure compliance
              with local regulations (HIPAA, GDPR, etc.).
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-neutral-400" />
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
            Upload File
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600 dark:text-neutral-300">Loading files...</div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-600 dark:text-neutral-300 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-neutral-300 mb-2">{t('member.medicalFiles.empty')}</p>
          <p className="text-sm text-gray-500 dark:text-neutral-400">Upload your lab results, scans, and medical documents to get started</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="member-card p-4 shadow-lg hover:border-orange-500/30 transition-all"
            >
              <ReportBrandHeader
                variant="strip"
                subtitle={file.category}
                className="mb-3"
              />
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                  {getFileIcon(file.file_type)}
                </div>
                <span className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-full">
                  {file.category}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-50 mb-2 line-clamp-2">{file.file_name}</h3>

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-neutral-400 mb-3">
                <span>{formatFileSize(file.file_size)}</span>
                <span>•</span>
                <span>{new Date(file.upload_date).toLocaleDateString()}</span>
              </div>

              {file.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {file.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 text-gray-600 dark:text-neutral-300 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleDownload(file)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center"
                  title="Download"
                >
                  <Download className="h-4 w-4 text-blue-600" />
                </button>
                <button
                  onClick={() => handleShare(file)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center"
                  title="Share"
                >
                  <Share2 className="h-4 w-4 text-emerald-600" />
                </button>
                <button
                  onClick={() => handlePrint(file)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center"
                  title="Print"
                >
                  <Printer className="h-4 w-4 text-purple-600" />
                </button>
                <button
                  onClick={() => handleCopy(file)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center"
                  title="Copy URL"
                >
                  <Copy className="h-4 w-4 text-yellow-600" />
                </button>
                <button
                  onClick={() => window.open(file.file_url, '_blank')}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center"
                  title="View"
                >
                  <Eye className="h-4 w-4 text-orange-500" />
                </button>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-2 bg-slate-100 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <ModalShell
          title="Upload Medical File"
          onClose={() => setShowUploadModal(false)}
          panelClassName="max-w-md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-neutral-200 mb-2">{t('member.medicalFiles.fileName')}</label>
              <input
                type="text"
                value={uploadForm.file_name}
                onChange={(e) => setUploadForm({ ...uploadForm, file_name: e.target.value })}
                className="w-full px-4 py-2 member-input"
                placeholder="Blood Test Results - Jan 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-neutral-200 mb-2">{t('member.medicalFiles.fileUrl')}</label>
              <input
                type="text"
                value={uploadForm.file_url}
                onChange={(e) => setUploadForm({ ...uploadForm, file_url: e.target.value })}
                className="w-full px-4 py-2 member-input"
                placeholder="https://example.com/file.pdf"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-neutral-200 mb-2">Category</label>
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
              <label className="block text-sm font-medium text-gray-600 dark:text-neutral-200 mb-2">{t('member.medicalFiles.fileType')}</label>
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
              <label className="block text-sm font-medium text-gray-600 dark:text-neutral-200 mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                value={uploadForm.tags}
                onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                className="w-full px-4 py-2 member-input"
                placeholder="blood, cholesterol, 2024"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleUpload}
              className="flex-1 px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all"
            >
              Upload
            </button>
            <button
              onClick={() => setShowUploadModal(false)}
              className="px-6 py-2 bg-slate-200 text-gray-700 dark:text-neutral-200 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
