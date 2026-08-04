import { useState, useEffect } from 'react';
import { Map, Eye, EyeOff, Save, CheckCircle, AlertCircle, Home, FileText, Building2, Users, Phone, DollarSign, Newspaper, Briefcase, BookOpen, FlaskConical, Shield, HelpCircle, Target, Gift, Stethoscope, BarChart3, Cog, GitBranch, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PageConfig {
  id: string;
  name: string;
  path: string;
  icon: any;
  enabled: boolean;
  category: 'main' | 'legal' | 'member' | 'admin' | 'marketing' | 'info';
  description: string;
}

export default function SiteMapManager() {
  const [pages, setPages] = useState<PageConfig[]>([
    { id: 'home', name: 'Home', path: '/', icon: Home, enabled: true, category: 'main', description: 'Main page' },
    { id: 'about', name: 'About', path: '/about', icon: FileText, enabled: true, category: 'main', description: 'About us' },
    { id: 'services', name: 'Services', path: '/services', icon: Building2, enabled: true, category: 'main', description: 'Services' },
    { id: 'catalog', name: 'Services Catalog', path: '/services-catalog', icon: Building2, enabled: true, category: 'main', description: 'Services catalog' },
    { id: 'pricing', name: 'Pricing', path: '/pricing', icon: DollarSign, enabled: true, category: 'main', description: 'Pricing' },
    { id: 'devices', name: 'Devices', path: '/devices', icon: Stethoscope, enabled: true, category: 'main', description: 'Devices' },
    { id: 'science', name: 'Science', path: '/science', icon: FlaskConical, enabled: true, category: 'main', description: 'Scientific research' },
    { id: 'reports', name: 'Reports', path: '/reports', icon: BarChart3, enabled: true, category: 'main', description: 'Reports' },
    { id: 'news', name: 'News', path: '/news', icon: Newspaper, enabled: true, category: 'main', description: 'News' },
    { id: 'blog', name: 'Blog', path: '/blog', icon: FileText, enabled: true, category: 'main', description: 'Blog' },
    { id: 'media', name: 'Media', path: '/media', icon: FileText, enabled: true, category: 'main', description: 'Videos, presentations, and documents' },
    { id: 'careers', name: 'Careers', path: '/careers', icon: Briefcase, enabled: true, category: 'main', description: 'Careers' },
    { id: 'contact', name: 'Contact', path: '/contact', icon: Phone, enabled: true, category: 'main', description: 'Contact' },
    { id: 'faq', name: 'FAQ', path: '/faq', icon: HelpCircle, enabled: true, category: 'main', description: 'Frequently Asked Questions' },
    { id: 'learning', name: 'Learning Center', path: '/learning-center', icon: BookOpen, enabled: true, category: 'main', description: 'Learning Center' },

    { id: 'how-it-works', name: 'How It Works', path: '/how-it-works', icon: Target, enabled: true, category: 'info', description: 'How the platform works' },
    { id: 'why-two-models', name: 'Why Two Models', path: '/why-two-models', icon: GitBranch, enabled: true, category: 'info', description: 'Explanation of dual AI models' },
    { id: 'privacy-trust', name: 'Trust and Privacy Center', path: '/privacy-trust', icon: Lock, enabled: true, category: 'info', description: 'Trust, privacy, and legal documents hub' },

    { id: 'investors', name: 'For Investors', path: '/investors', icon: Target, enabled: true, category: 'marketing', description: 'Information for investors' },
    { id: 'partnership', name: 'Partnership', path: '/partnership', icon: Users, enabled: true, category: 'marketing', description: 'Partnership program' },
    { id: 'refer', name: 'Refer', path: '/refer', icon: Gift, enabled: true, category: 'marketing', description: 'Invite friends and ambassador program' },

    { id: 'member-zone', name: 'Cabinet', path: '/member-zone', icon: Users, enabled: true, category: 'member', description: 'Cabinet dashboard' },
    { id: 'command-center', name: 'Command Center', path: '/command-center', icon: Cog, enabled: true, category: 'member', description: 'Command center' },

    { id: 'admin', name: 'Admin Panel', path: '/admin', icon: Shield, enabled: true, category: 'admin', description: 'Admin panel' },

    { id: 'privacy', name: 'Privacy Policy', path: '/legal/privacy-policy', icon: Shield, enabled: true, category: 'legal', description: 'Privacy policy' },
    { id: 'terms', name: 'Terms of Service', path: '/legal/terms-of-service', icon: FileText, enabled: true, category: 'legal', description: 'Terms of service' },
    { id: 'gdpr', name: 'GDPR', path: '/legal/gdpr', icon: Shield, enabled: true, category: 'legal', description: 'GDPR compliance' },
    { id: 'hipaa', name: 'HIPAA Notice', path: '/legal/hipaa-notice', icon: Shield, enabled: true, category: 'legal', description: 'HIPAA notice' },
    { id: 'disclaimer', name: 'Disclaimer', path: '/legal/disclaimer', icon: AlertCircle, enabled: true, category: 'legal', description: 'Disclaimer' },
    { id: 'security', name: 'Security', path: '/legal/security', icon: Shield, enabled: true, category: 'legal', description: 'Security' },
  ]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const togglePage = (pageId: string) => {
    setPages(prev => prev.map(page =>
      page.id === pageId ? { ...page, enabled: !page.enabled } : page
    ));
  };

  const toggleCategory = (category: string, enabled: boolean) => {
    setPages(prev => prev.map(page =>
      page.category === category ? { ...page, enabled } : page
    ));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      setMessage({
        type: 'success',
        text: 'Page configuration saved'
      });

      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Page configuration save failed' });
    } finally {
      setSaving(false);
    }
  };

  const groupedPages = {
    main: pages.filter(p => p.category === 'main'),
    info: pages.filter(p => p.category === 'info'),
    marketing: pages.filter(p => p.category === 'marketing'),
    member: pages.filter(p => p.category === 'member'),
    admin: pages.filter(p => p.category === 'admin'),
    legal: pages.filter(p => p.category === 'legal'),
  };

  const categoryStats = Object.entries(groupedPages).map(([category, items]) => ({
    category,
    total: items.length,
    enabled: items.filter(p => p.enabled).length
  }));

  const categoryNames: Record<string, string> = {
    main: 'Main Pages',
    info: 'Info & Help',
    marketing: 'Marketing',
    member: 'Member Pages',
    admin: 'Administration',
    legal: 'Legal Pages'
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="bg-white/90 rounded-2xl border border-slate-200 p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Map className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Site Map & Page Visibility</h2>
            <p className="text-gray-600 text-sm mt-1">
              Manage site page visibility
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {categoryStats.map(({ category, total, enabled }) => (
            <div
              key={category}
              className="bg-white p-4 rounded-lg border border-slate-200"
            >
              <div className="text-2xl font-semibold text-gray-900">{enabled}/{total}</div>
              <div className="text-xs text-gray-600 mt-1">
                {categoryNames[category]?.replace(/^[^\s]+ /, '')}
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => toggleCategory(category, true)}
                  className="flex-1 px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                >
                  Enable All
                </button>
                <button
                  onClick={() => toggleCategory(category, false)}
                  className="flex-1 px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                >
                  Disable All
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {Object.entries(groupedPages).map(([category, items]) => {
            if (items.length === 0) return null;

            return (
              <div key={category} className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900 border-b border-slate-200 pb-2">
                  {categoryNames[category]}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((page) => {
                    const Icon = page.icon;
                    return (
                      <button
                        key={page.id}
                        onClick={() => togglePage(page.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          page.enabled
                            ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-5 h-5 ${page.enabled ? 'text-green-400' : 'text-gray-500'}`} />
                            <div>
                              <div className={`font-semibold ${page.enabled ? 'text-white' : 'text-gray-500'}`}>
                                {page.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">{page.path}</div>
                            </div>
                          </div>
                          <div className={`p-1 rounded ${page.enabled ? 'bg-green-500/20' : 'bg-slate-200'}`}>
                            {page.enabled ? (
                              <Eye className="w-4 h-4 text-green-400" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                        <p className={`text-xs mt-2 ${page.enabled ? 'text-gray-600' : 'text-gray-600'}`}>
                          {page.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          How it works
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>🟢 <strong>Green cards</strong> - page is active and accessible to users</li>
          <li>⚫ <strong>Gray cards</strong> - page is hidden (returns 404 or redirect)</li>
          <li>🔘 <strong>Category buttons</strong> - quickly enable/disable all pages in category</li>
          <li>💾 <strong>After changes</strong> - click "Save" to apply changes</li>
          <li>⚠️ <strong>Important:</strong> Disabling Admin Panel will block access to settings</li>
        </ul>
      </div>
    </div>
  );
}
