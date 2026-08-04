import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import MemberMetricCard from '../../components/ui/MemberMetricCard';

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
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <MemberMetricCard
          accent="blue"
          icon={<FileText className="h-6 w-6" />}
          value={t('member.secondOpinion.aiModelsCount')}
          label={t('member.secondOpinion.aiModels')}
        />
        <MemberMetricCard
          accent="emerald"
          icon={<CheckCircle className="h-6 w-6" />}
          value={t('member.secondOpinion.evidenceBasedValue')}
          label={t('member.secondOpinion.researchBacked')}
        />
        <MemberMetricCard
          accent="orange"
          icon={<Clock className="h-6 w-6" />}
          value={t('member.secondOpinion.analysisTimeValue')}
          label={t('member.secondOpinion.analysisTime')}
        />
      </div>

      <div className="member-card mb-6 p-6">
        <h3 className="member-heading mb-4 text-lg font-semibold">{t('member.secondOpinion.submitQuestion')}</h3>
        <div className="space-y-4">
          <div>
            <label className="member-body mb-2 block text-sm font-medium">
              {t('member.secondOpinion.healthQuestion')}
            </label>
            <textarea
              value={request.question}
              onChange={(e) => setRequest({ ...request, question: e.target.value })}
              rows={3}
              className="member-input w-full px-4 py-2"
              placeholder={t('member.secondOpinion.questionPlaceholder')}
            />
          </div>
          <div>
            <label className="member-body mb-2 block text-sm font-medium">
              {t('member.secondOpinion.medicalContext')}
            </label>
            <textarea
              value={request.context}
              onChange={(e) => setRequest({ ...request, context: e.target.value })}
              rows={3}
              className="member-input w-full px-4 py-2"
              placeholder={t('member.secondOpinion.contextPlaceholder')}
            />
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!request.question || status === 'processing'}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-3 text-white transition-all hover:from-orange-500 hover:to-orange-600 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
            {status === 'processing'
              ? t('member.secondOpinion.analyzing')
              : t('member.secondOpinion.getSecondOpinion')}
          </button>
        </div>
      </div>

      {status === 'processing' && (
        <div className="member-card mb-6 border-orange-200 p-6">
          <h3 className="member-heading mb-4 text-base font-semibold">{t('member.secondOpinion.processing')}</h3>
          <div className="mb-4 flex items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-orange-500" />
            <p className="member-heading font-semibold">{t('member.secondOpinion.analyzingDual')}</p>
          </div>
          <div className="space-y-2">
            <div className="member-body flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{t('member.secondOpinion.model1')}</span>
            </div>
            <div className="member-body flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 animate-pulse text-orange-500" />
              <span>{t('member.secondOpinion.model2')}</span>
            </div>
          </div>
        </div>
      )}

      {status === 'ready' && (
        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <div className="member-card rounded-xl border-l-4 border-l-blue-500 p-6">
            <div className="mb-3 flex items-center gap-2">
              <h4 className="member-heading flex items-center gap-2 text-lg font-semibold">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                {t('member.secondOpinion.opinion1Title')}
              </h4>
            </div>
            <p className="member-body mb-4 text-sm">{t('member.secondOpinion.opinion1Body')}</p>
            <div className="space-y-2">
              <div className="member-muted text-xs">
                {t('member.secondOpinion.confidence')}: {t('member.secondOpinion.confidence1')}
              </div>
              <div className="member-muted text-xs">
                {t('member.secondOpinion.sources')}: {t('member.secondOpinion.sourcesCount')}
              </div>
            </div>
          </div>

          <div className="member-card rounded-xl border-l-4 border-l-emerald-500 p-6">
            <div className="mb-3 flex items-center gap-2">
              <h4 className="member-heading flex items-center gap-2 text-lg font-semibold">
                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                {t('member.secondOpinion.opinion2Title')}
              </h4>
            </div>
            <p className="member-body mb-4 text-sm">{t('member.secondOpinion.opinion2Body')}</p>
            <div className="space-y-2">
              <div className="member-muted text-xs">
                {t('member.secondOpinion.confidence')}: {t('member.secondOpinion.confidence2')}
              </div>
              <div className="member-muted text-xs">
                {t('member.secondOpinion.personalization')}: {t('member.secondOpinion.personalizationHigh')}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700 dark:text-amber-300" />
          <div>
            <p className="mb-1 text-sm font-medium text-amber-800 dark:text-amber-200">
              {t('member.secondOpinion.disclaimer')}
            </p>
            <p className="text-xs text-amber-800/80 dark:text-amber-200/80">
              {t('member.secondOpinion.disclaimerBody')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
