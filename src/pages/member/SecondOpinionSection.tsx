import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, Send, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import ReportBrandHeader from '../../components/report/ReportBrandHeader';

export default function SecondOpinionSection() {
  const { t } = useTranslation();
  const [request, setRequest] = useState({ question: '', context: '' });
  const [status, setStatus] = useState<'idle' | 'processing' | 'ready'>('idle');

  const handleSubmit = () => {
    setStatus('processing');
    setTimeout(() => setStatus('ready'), 2000);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2 flex items-center gap-3">
          <Scale className="h-8 w-8 text-orange-500" />
          {t('member.secondOpinion.title')}
        </h1>
        <p className="text-gray-600">{t('member.secondOpinion.subtitle')}</p>
      </div>

      <ReportBrandHeader
        title="BioMath Core"
        subtitle="Second Opinion Engine"
        variant="strip"
        className="mb-6"
      />

      <div className="mb-6 grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <ReportBrandHeader variant="strip" subtitle="AI Models" className="mb-3" />
          <FileText className="h-6 w-6 text-blue-600 mb-2" />
          <p className="text-2xl font-semibold text-gray-900">2</p>
          <p className="text-xs text-gray-600">AI Models</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <ReportBrandHeader variant="strip" subtitle="Evidence-Based" className="mb-3" />
          <CheckCircle className="h-6 w-6 text-emerald-600 mb-2" />
          <p className="text-2xl font-semibold text-gray-900">Evidence-Based</p>
          <p className="text-xs text-gray-600">{t('member.secondOpinion.researchBacked')}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <ReportBrandHeader variant="strip" subtitle="Analysis Time" className="mb-3" />
          <Clock className="h-6 w-6 text-orange-500 mb-2" />
          <p className="text-2xl font-semibold text-gray-900">~2 min</p>
          <p className="text-xs text-gray-600">{t('member.secondOpinion.analysisTime')}</p>
        </div>
      </div>

      <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-lg mb-6">
        <ReportBrandHeader variant="strip" subtitle="Submit Question" className="mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('member.secondOpinion.submitQuestion')}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('member.secondOpinion.healthQuestion')}</label>
            <textarea
              value={request.question}
              onChange={(e) => setRequest({ ...request, question: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder={t('member.secondOpinion.questionPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medical Context (Optional)</label>
            <textarea
              value={request.context}
              onChange={(e) => setRequest({ ...request, context: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder={t('member.secondOpinion.contextPlaceholder')}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!request.question || status === 'processing'}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="h-5 w-5" />
            {status === 'processing' ? 'Analyzing...' : 'Get Second Opinion'}
          </button>
        </div>
      </div>

      {status === 'processing' && (
        <div className="bg-white/90 border border-orange-200 rounded-2xl p-6 shadow-lg">
          <ReportBrandHeader variant="strip" subtitle="Processing" className="mb-4" />
          <div className="flex items-center gap-3 mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            <p className="text-gray-900 font-semibold">Analyzing with dual AI models...</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Model 1: Evidence-based analysis</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-orange-500 animate-pulse" />
              <span>Model 2: Contextual analysis</span>
            </div>
          </div>
        </div>
      )}

      {status === 'ready' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <ReportBrandHeader variant="strip" subtitle="Opinion #1" className="mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Opinion #1: Evidence-Based
            </h4>
            <p className="text-sm text-gray-700 mb-4">
              Based on current medical research and clinical guidelines, this is a simulated response. In production, this would connect to an actual AI model to provide evidence-based health guidance.
            </p>
            <div className="space-y-2">
              <div className="text-xs text-gray-500">Confidence: 85%</div>
              <div className="text-xs text-gray-500">Sources: 12 medical papers</div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
            <ReportBrandHeader variant="strip" subtitle="Opinion #2" className="mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Opinion #2: Contextual
            </h4>
            <p className="text-sm text-gray-700 mb-4">
              Considering your specific context and medical history, this is a simulated contextual response. Production version would analyze your complete health profile for personalized guidance.
            </p>
            <div className="space-y-2">
              <div className="text-xs text-gray-500">Confidence: 78%</div>
              <div className="text-xs text-gray-500">Personalization: High</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
        <ReportBrandHeader variant="strip" subtitle="Medical Disclaimer" className="mb-3" />
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-700 font-medium mb-1">{t('member.secondOpinion.disclaimer')}</p>
            <p className="text-xs text-yellow-700/80">
              AI opinions are for informational purposes only. Always consult with qualified healthcare professionals
              for medical advice, diagnosis, or treatment. Do not use AI opinions as a substitute for professional medical care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
