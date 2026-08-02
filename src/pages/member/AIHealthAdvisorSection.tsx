import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, AlertCircle, Scale, Brain } from 'lucide-react';

import ReportBrandHeader from '../../components/report/ReportBrandHeader';

export default function AIHealthAdvisorSection() {
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<{
    opinion1: string | null;
    opinion2: string | null;
  }>({ opinion1: null, opinion2: null });

  const handleSubmit = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setResponses({ opinion1: null, opinion2: null });

    setTimeout(() => {
      setResponses({
        opinion1: `AI Opinion #1 (Evidence-Based): Based on current medical research and clinical guidelines regarding "${question}", I would recommend consulting with a healthcare professional for personalized advice. This is a simulated response demonstrating the dual opinion system.`,
        opinion2: `AI Opinion #2 (Contextual): Taking into account your specific health profile and the question "${question}", here's a contextual perspective. This second AI model provides complementary insights. This is a simulated response for demonstration purposes.`
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
    <div>
      <ReportBrandHeader
        title="BioMath Core"
        subtitle={t('healthGuide.name')}
        variant="strip"
        className="mb-6"
      />

      <div className="mb-6 border border-amber-500/25 bg-amber-500/10 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-700 dark:text-amber-300 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-1">
              {t('healthGuide.medicalDisclaimer')}
            </p>
            <p className="text-xs text-amber-800/80 dark:text-amber-200/80">
              {t('healthGuide.medicalDisclaimerBody')}
            </p>
          </div>
        </div>
      </div>

      <div className="member-card p-6 shadow-lg mb-6">
        <ReportBrandHeader variant="strip" subtitle="Ask Your Question" className="mb-4" />
        <h3 className="text-lg font-semibold member-heading mb-4">{t('member.healthGuide.ask')}</h3>
        <div className="space-y-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={4}
            placeholder={t('member.healthGuide.askPlaceholder')}
            className="w-full px-4 py-3 member-input resize-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!question.trim() || loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Analyzing with dual AI...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Get Dual AI Opinions
              </>
            )}
          </button>
        </div>
      </div>

      {loading && (
        <div className="member-card border-orange-200 p-6 mb-6 shadow-lg">
          <ReportBrandHeader variant="strip" subtitle="Dual AI Processing" className="mb-4" />
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              <p className="member-heading font-semibold">Analyzing your question with dual AI models...</p>
            </div>
            <div className="space-y-2 pl-8">
              <div className="flex items-center gap-2 text-sm member-body">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>AI Model #1: Evidence-based analysis</span>
              </div>
              <div className="flex items-center gap-2 text-sm member-body">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>AI Model #2: Contextual analysis</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && responses.opinion1 && responses.opinion2 && (
        <div>
          <h3 className="text-xl font-semibold member-heading mb-4 flex items-center gap-2">
            <Brain className="h-6 w-6 text-orange-500" />
            Dual AI Opinions
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="member-card rounded-xl border-l-4 border-l-blue-500 p-6 shadow-sm">
              <ReportBrandHeader variant="strip" subtitle="Opinion #1" className="mb-4" />
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[var(--bm-surface)] border border-[var(--bm-border)]">
                  <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold member-heading">AI Opinion #1</h4>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Evidence-Based Perspective</p>
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="member-body whitespace-pre-wrap">{responses.opinion1}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--bm-border)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="member-muted">Confidence:</span>
                  <span className="text-blue-700 dark:text-blue-400 font-semibold">85%</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="member-muted">Sources:</span>
                  <span className="text-blue-700 dark:text-blue-400 font-semibold">Medical research</span>
                </div>
              </div>
            </div>

            <div className="member-card rounded-xl border-l-4 border-l-emerald-500 p-6 shadow-sm">
              <ReportBrandHeader variant="strip" subtitle="Opinion #2" className="mb-4" />
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[var(--bm-surface)] border border-[var(--bm-border)]">
                  <Scale className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold member-heading">AI Opinion #2</h4>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Contextual Perspective</p>
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="member-body whitespace-pre-wrap">{responses.opinion2}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--bm-border)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="member-muted">Confidence:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">78%</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="member-muted">Personalization:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">High</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 member-card p-6 shadow-lg">
            <ReportBrandHeader variant="strip" subtitle="Key Insights" className="mb-4" />
            <h4 className="text-lg font-semibold member-heading mb-3">{t('member.healthGuide.keyInsights')}</h4>
            <ul className="space-y-2 text-sm member-body">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Both AI models agree on the importance of consulting healthcare professionals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Evidence-based opinion focuses on general medical guidelines</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Contextual opinion considers your individual health profile</span>
              </li>
            </ul>
            <button
              onClick={() => {
                setQuestion('');
                setResponses({ opinion1: null, opinion2: null });
              }}
              className="mt-4 px-6 py-2 member-btn text-blue-700 dark:text-blue-400 hover:border-blue-400 transition-colors"
            >
              Ask Another Question
            </button>
          </div>
        </div>
      )}

      {!loading && !responses.opinion1 && (
        <div className="text-center py-12">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-neutral-300 mb-2">{t('member.healthGuide.empty')}</p>
          <p className="text-sm text-gray-500 dark:text-neutral-400">{t('member.healthGuide.emptyHint')}</p>
        </div>
      )}
    </div>
  );
}
