import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, AlertCircle, Scale, Brain, Loader2 } from 'lucide-react';

import { supabase } from '../../lib/supabase';
import MemberDemoBadge from '../../components/MemberDemoBadge';
import PersonalContextIndicator from '../../components/PersonalContextIndicator';
import {
  buildPersonalContext,
  type PersonalContext,
} from '../../lib/personalContext';

export default function AIHealthAdvisorSection() {
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [personalContext, setPersonalContext] = useState<PersonalContext | null>(null);
  const [contextLoading, setContextLoading] = useState(true);
  const [responses, setResponses] = useState<{
    opinion1: string | null;
    opinion2: string | null;
  }>({ opinion1: null, opinion2: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setContextLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) {
        if (!cancelled) setContextLoading(false);
        return;
      }
      const ctx = await buildPersonalContext(user.id);
      if (!cancelled) {
        setPersonalContext(ctx);
        setContextLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setResponses({ opinion1: null, opinion2: null });

    const context = personalContext?.aiPayload.systemPreface || personalContext?.contextBlurb;
    const contextLine = context
      ? ` ${t('member.healthGuide.questionnaireContextTitle')}: ${context}.`
      : ` ${t('member.healthGuide.questionnaireContextEmpty')}`;

    setTimeout(() => {
      setResponses({
        opinion1: `${t('healthGuide.name')} ${t('member.healthGuide.opinion1Title')} (${t('member.healthGuide.opinion1Subtitle')}): "${question}" — ${t('member.healthGuide.insight1')}`,
        opinion2: `${t('healthGuide.name')} ${t('member.healthGuide.opinion2Title')} (${t('member.healthGuide.opinion2Subtitle')}): "${question}".${contextLine}`,
      });
      setLoading(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <MemberDemoBadge labelKey="member.healthGuide.demoBadge" />
        <p className="text-xs member-muted">{t('member.healthGuide.simulatedNote')}</p>
      </div>

      <div className="border border-amber-500/25 bg-amber-500/10 dark:bg-amber-900/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-700 dark:text-amber-300 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-1">
              {t('healthGuide.medicalDisclaimer')}
            </p>
            <p className="text-xs text-amber-800/80 dark:text-amber-200/80 member-body">
              {t('healthGuide.medicalDisclaimerBody')}
            </p>
          </div>
        </div>
      </div>

      <PersonalContextIndicator context={personalContext} loading={contextLoading} />

      <div className="member-card p-4">
        <p className="text-sm font-semibold member-heading mb-1">
          {t('member.healthGuide.questionnaireContextTitle')}
        </p>
        {personalContext ? (
          <p className="text-xs member-body">
            {t('member.healthGuide.questionnaireContextBody', {
              percent: personalContext.completeness.questionnairePercent,
              completed: personalContext.questionnaire?.completedCount ?? 0,
              total: personalContext.questionnaire?.unlockedCount ?? 0,
            })}
            {personalContext.contextBlurb ? (
              <span className="block mt-1 member-muted">{personalContext.contextBlurb}</span>
            ) : null}
          </p>
        ) : (
          <p className="text-xs member-muted">{t('member.healthGuide.questionnaireContextEmpty')}</p>
        )}
      </div>

      <div className="member-card p-6 shadow-lg">
        <h3 className="member-heading text-lg mb-4">{t('member.healthGuide.ask')}</h3>
        <div className="space-y-4">
          <label className="sr-only" htmlFor="health-guide-question">
            {t('member.healthGuide.ask')}
          </label>
          <textarea
            id="health-guide-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={4}
            placeholder={t('member.healthGuide.askPlaceholder')}
            className="w-full px-4 py-3 member-input resize-none"
            aria-label={t('member.healthGuide.ask')}
          />
          <button
            onClick={handleSubmit}
            disabled={!question.trim() || loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t('member.healthGuide.analyzing')}
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                {t('member.healthGuide.getOpinions')}
              </>
            )}
          </button>
        </div>
      </div>

      {loading && (
        <div className="member-card border-orange-200 p-6 shadow-lg">
          <h4 className="member-heading mb-4">{t('member.healthGuide.dualProcessing')}</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
              <p className="member-heading font-semibold">{t('member.healthGuide.analyzingDual')}</p>
            </div>
            <div className="space-y-2 pl-8">
              <div className="flex items-center gap-2 text-sm member-body">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{t('member.healthGuide.model1')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm member-body">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>{t('member.healthGuide.model2')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && responses.opinion1 && responses.opinion2 && (
        <div>
          <h3 className="member-heading text-xl mb-4 flex items-center gap-2">
            <Brain className="h-6 w-6 text-orange-500" />
            {t('member.healthGuide.dualOpinions')}
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="member-card rounded-xl border-l-4 border-l-blue-500 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[var(--bm-surface)] border border-[var(--bm-border)]">
                  <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="member-heading text-lg">{t('member.healthGuide.opinion1Title')}</h4>
                    <MemberDemoBadge labelKey="member.healthGuide.demoBadge" />
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">{t('member.healthGuide.opinion1Subtitle')}</p>
                </div>
              </div>
              <p className="member-body whitespace-pre-wrap">{responses.opinion1}</p>
              <div className="mt-4 pt-4 border-t border-[var(--bm-border)] text-xs">
                <div className="flex items-center justify-between">
                  <span className="member-muted">{t('member.healthGuide.confidence')}</span>
                  <span className="text-blue-700 dark:text-blue-400 font-semibold">85%</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="member-muted">{t('member.healthGuide.sources')}</span>
                  <span className="text-blue-700 dark:text-blue-400 font-semibold">{t('member.healthGuide.sourcesMedical')}</span>
                </div>
              </div>
            </div>

            <div className="member-card rounded-xl border-l-4 border-l-emerald-500 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[var(--bm-surface)] border border-[var(--bm-border)]">
                  <Scale className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="member-heading text-lg">{t('member.healthGuide.opinion2Title')}</h4>
                    <MemberDemoBadge labelKey="member.healthGuide.demoBadge" />
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">{t('member.healthGuide.opinion2Subtitle')}</p>
                </div>
              </div>
              <p className="member-body whitespace-pre-wrap">{responses.opinion2}</p>
              <div className="mt-4 pt-4 border-t border-[var(--bm-border)] text-xs">
                <div className="flex items-center justify-between">
                  <span className="member-muted">{t('member.healthGuide.confidence')}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">78%</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="member-muted">{t('member.healthGuide.personalization')}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{t('member.healthGuide.personalizationHigh')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 member-card p-6 shadow-lg">
            <h4 className="member-heading text-lg mb-3">{t('member.healthGuide.keyInsights')}</h4>
            <ul className="space-y-2 text-sm member-body">
              {[t('member.healthGuide.insight1'), t('member.healthGuide.insight2'), t('member.healthGuide.insight3')].map((insight) => (
                <li key={insight} className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => {
                setQuestion('');
                setResponses({ opinion1: null, opinion2: null });
              }}
              className="mt-4 px-6 py-2 member-btn text-blue-700 dark:text-blue-400 hover:border-blue-400 transition-colors"
            >
              {t('member.healthGuide.askAnother')}
            </button>
          </div>
        </div>
      )}

      {!loading && !responses.opinion1 && (
        <div className="text-center py-12 member-card">
          <Brain className="h-16 w-16 member-muted mx-auto mb-4" />
          <p className="member-body mb-2">{t('member.healthGuide.empty')}</p>
          <p className="text-sm member-muted">{t('member.healthGuide.emptyHint')}</p>
        </div>
      )}
    </div>
  );
}
