import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Lock, Copy, Printer, Share2, Download, FileDown, ChevronDown, ChevronUp, BookOpen, MessageSquareText, Brain, Scale, GitCompare, FileOutput, Layers } from 'lucide-react';
import { resolveServiceRef, serviceDetailPath } from '../data/services';
import { supabase } from '../lib/supabase';
import { notifyUserError, notifyUserInfo } from '../lib/adminNotify';
import SEO from '../components/SEO';
import { addKnowledgeSignals, buildAggregatedSecondOpinion, estimateLocalSignalCounts, getKnowledgeSignalScore, loadKnowledgeSnapshot, shouldUseMultiModel } from '../lib/secondOpinionEngine';
import type { UserKnowledgeSnapshot } from '../lib/secondOpinionEngine';
import ReportBrandHeader from '../components/report/ReportBrandHeader';
import ModelRadarComparison, { buildModelScores } from '../components/report/ModelRadarComparison';
import { localizeCategory, localizeService } from '../lib/localizeServices';
import PersonalContextIndicator from '../components/PersonalContextIndicator';
import {
  buildPersonalContext,
  type PersonalContext,
} from '../lib/personalContext';
import {
  canGeneratePersonalizedReport,
  generatePersonalizedReport,
} from '../lib/reports';

const categoryColors: Record<string, string> = {
  'human-data-model': 'text-slate-500 dark:text-slate-300',
  'critical-health': 'text-orange-500',
  'everyday-wellness': 'text-green-500',
  longevity: 'text-pink-500',
  'mental-wellness': 'text-cyan-500',
  'fitness-performance': 'text-yellow-500',
  'womens-health': 'text-pink-500',
  'mens-health': 'text-blue-500',
  'beauty-skincare': 'text-pink-500',
  'nutrition-diet': 'text-green-500',
  'sleep-recovery': 'text-purple-500',
  'environmental-health': 'text-teal-500',
  'family-health': 'text-orange-500',
  'preventive-medicine': 'text-cyan-500',
  biohacking: 'text-blue-500',
  'senior-care': 'text-amber-800 dark:text-amber-500',
  'eye-health': 'text-blue-500',
  'digital-therapeutics': 'text-purple-500',
  'general-sexual': 'text-red-500',
  'mens-sexual-health': 'text-blue-500',
  'womens-sexual-health': 'text-pink-500',
};

interface ServiceDetailProps {
  onNavigate: (page: string, param?: string) => void;
  serviceId?: string;
  /** Full interactive workspace inside Member Zone (no public chrome). */
  embedded?: boolean;
  onBack?: () => void;
}

const serviceFAQDatabase: Record<string, Array<{ question: string; answer: string }>> = {
  'blood-glucose': [
    { question: 'What does blood glucose monitoring tell me?', answer: 'Blood glucose patterns reveal how your body processes energy, responds to food, and regulates insulin. This insight helps optimize diet timing and prevent energy crashes.' },
    { question: 'Why track glucose if I\'m not diabetic?', answer: 'Even in healthy individuals, glucose stability affects energy, focus, mood, and long-term metabolic health. Early awareness prevents future issues.' },
    { question: 'When should I check my glucose?', answer: 'Morning fasting, before/after meals, and during energy dips give the most insight. Continuous monitors provide 24/7 data automatically.' },
    { question: 'How often should I review trends?', answer: 'Weekly reviews help identify patterns. Daily checks are useful during diet changes or new routines.' },
    { question: 'Can this replace medical testing?', answer: 'No. This is educational wellness tracking. Medical diabetes testing requires clinical lab work and professional interpretation.' },
    { question: 'What improves glucose stability?', answer: 'Consistent meal timing, balanced macros, regular movement, quality sleep, and stress management all support stable glucose levels.' }
  ],
  'heart-rate': [
    { question: 'What does heart rate variability reveal?', answer: 'HRV shows your nervous system balance between stress and recovery. Higher HRV typically indicates better resilience and adaptation.' },
    { question: 'Why track resting heart rate?', answer: 'Resting HR trends reveal fitness improvements, stress accumulation, illness onset, and recovery quality over time.' },
    { question: 'When is the best time to measure?', answer: 'Morning, right after waking, before getting out of bed provides the most consistent baseline measurement.' },
    { question: 'How often should I check?', answer: 'Daily morning checks create reliable trends. Wearables provide continuous monitoring automatically.' },
    { question: 'Does this replace medical monitoring?', answer: 'No. For heart conditions or arrhythmia concerns, always consult a cardiologist. This is wellness tracking, not medical diagnosis.' },
    { question: 'What improves heart metrics?', answer: 'Regular aerobic exercise, quality sleep, stress management, hydration, and avoiding excessive caffeine all support healthy heart patterns.' }
  ],
  'sleep': [
    { question: 'What does sleep analysis measure?', answer: 'Sleep tracking reveals duration, quality, sleep stages, wake frequency, and consistency patterns that affect recovery and daytime function.' },
    { question: 'Why analyze sleep stages?', answer: 'Deep sleep supports physical recovery, REM sleep aids memory and emotional processing. Balanced stages indicate restorative sleep.' },
    { question: 'When should I review my sleep data?', answer: 'Weekly reviews show patterns. Daily checks help during routine changes or if you notice daytime fatigue.' },
    { question: 'How much data is needed?', answer: 'One week provides initial patterns. 2-4 weeks reveal meaningful trends and cycle variations.' },
    { question: 'Can this diagnose sleep disorders?', answer: 'No. Sleep apnea, insomnia, or other disorders require medical sleep studies. This tracks general wellness patterns.' },
    { question: 'What improves sleep quality?', answer: 'Consistent bedtime, cool dark room, limited screens before bed, regular exercise, and stress management all enhance sleep.' }
  ],
  'stress': [
    { question: 'How is stress measured biologically?', answer: 'Physiological stress shows through heart rate variability, cortisol patterns, sleep disruption, and nervous system markers.' },
    { question: 'Why track stress objectively?', answer: 'Subjective stress perception doesn\'t always match biological impact. Objective data reveals hidden stress accumulation before burnout.' },
    { question: 'When should I check stress levels?', answer: 'During high-demand periods, life changes, or when noticing fatigue, mood shifts, or sleep issues.' },
    { question: 'How often is tracking useful?', answer: 'Daily during stressful periods helps identify triggers. Weekly checks maintain awareness during normal times.' },
    { question: 'Does this replace mental health care?', answer: 'No. For anxiety, depression, or chronic stress, professional therapy and medical support are essential. This supports self-awareness.' },
    { question: 'What reduces biological stress?', answer: 'Regular movement, breathing exercises, quality sleep, social connection, nature time, and mindfulness practices all lower stress markers.' }
  ],
  'nutrition': [
    { question: 'What does nutritional analysis assess?', answer: 'Nutrition tracking evaluates macro balance, micronutrient intake, meal timing, hydration, and how food choices affect energy and biomarkers.' },
    { question: 'Why analyze nutrition patterns?', answer: 'Most people have hidden deficiencies or imbalances. Data-driven nutrition optimizes energy, immunity, recovery, and long-term health.' },
    { question: 'When should I track nutrition?', answer: 'During diet changes, unexplained fatigue, training programs, or when optimizing health goals.' },
    { question: 'How long should I track?', answer: '2-4 weeks reveals true patterns. Shorter periods miss weekly variation and eating cycles.' },
    { question: 'Can this replace a dietitian?', answer: 'No. Complex medical nutrition therapy needs professional guidance. This provides educational awareness and general optimization.' },
    { question: 'What improves nutritional status?', answer: 'Whole food diversity, consistent meal timing, adequate protein, colorful vegetables, hydration, and mindful eating all enhance nutrition.' }
  ],
  'recovery': [
    { question: 'What does recovery tracking measure?', answer: 'Recovery analysis combines sleep quality, HRV, resting heart rate, muscle soreness, and readiness scores to assess your body\'s restoration status.' },
    { question: 'Why monitor recovery?', answer: 'Training without adequate recovery leads to overtraining, injury, and diminished results. Recovery data guides smart training intensity.' },
    { question: 'When should I check recovery?', answer: 'Every morning before training helps adjust daily intensity. Post-workout tracking guides rest periods.' },
    { question: 'How does recovery guide training?', answer: 'High recovery = train hard. Low recovery = rest or light activity. This prevents overtraining and optimizes adaptation.' },
    { question: 'Is this medical recovery tracking?', answer: 'No. Post-surgery or injury recovery requires medical supervision. This is athletic and wellness recovery optimization.' },
    { question: 'What enhances recovery?', answer: 'Quality sleep, protein intake, hydration, active rest, stretching, stress management, and strategic training intensity all improve recovery.' }
  ]
};

export default function ServiceDetail({ onNavigate, serviceId, embedded = false, onBack }: ServiceDetailProps) {
  const { t } = useTranslation();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [showSecondOpinion, setShowSecondOpinion] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const multiModelEnabled = shouldUseMultiModel();
  const [selectedAI, setSelectedAI] = useState<'ai1' | 'ai2' | 'both'>(multiModelEnabled ? 'both' : 'ai1');
  const [userQuestion, setUserQuestion] = useState('');
  const [firstOpinion, setFirstOpinion] = useState('');
  const [secondOpinion, setSecondOpinion] = useState('');
  const [knowledgeSnapshot, setKnowledgeSnapshot] = useState<UserKnowledgeSnapshot | null>(null);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draftOpinionA, setDraftOpinionA] = useState('');
  const [draftOpinionB, setDraftOpinionB] = useState('');
  const [dialogInput, setDialogInput] = useState('');
  const [dialog, setDialog] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);
  const [showWhySummary, setShowWhySummary] = useState(false);
  const [personalContext, setPersonalContext] = useState<PersonalContext | null>(null);
  const [personalContextLoading, setPersonalContextLoading] = useState(false);
  const getSnapshotUserId = (snapshot: UserKnowledgeSnapshot | null) => snapshot?.userId;
  const showPersonalContextIndicator =
    embedded && (isGenerating || reportGenerated || Boolean(userQuestion.trim()) || dialog.length > 0);

  const aggregatedOpinion = useMemo(() => {
    if (!firstOpinion || !secondOpinion) return null;
    return buildAggregatedSecondOpinion(firstOpinion, secondOpinion, knowledgeSnapshot);
  }, [firstOpinion, secondOpinion, knowledgeSnapshot]);
  const knowledgeScore = useMemo(() => getKnowledgeSignalScore(knowledgeSnapshot), [knowledgeSnapshot]);
  const modelScores = useMemo(() => {
    if (!firstOpinion || !secondOpinion) return null;
    return {
      a: buildModelScores('A', firstOpinion, 0.02),
      b: buildModelScores('B', secondOpinion, -0.02),
    };
  }, [firstOpinion, secondOpinion]);
  const reportSignature = useMemo(() => {
    const seed = `${serviceId || 'service'}:${userQuestion}:${firstOpinion}:${secondOpinion}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) % 1000000007;
    }
    return `BMC-${hash.toString(16).toUpperCase()}`;
  }, [serviceId, userQuestion, firstOpinion, secondOpinion]);

  const knowledgeGaps = useMemo(() => {
    const expected = ['profile', 'devices', 'reports', 'inputs', 'services', 'documents'];
    const present = new Set((knowledgeSnapshot?.sources || []).map((s) => s.key));
    return expected.filter((key) => !present.has(key as any));
  }, [knowledgeSnapshot]);

  useEffect(() => {
    // Inside Member Zone the user is already authenticated — unlock full interactive UI.
    if (embedded) {
      setIsSignedIn(true);
      return;
    }
    checkAuth();
  }, [embedded]);

  useEffect(() => {
    if (!embedded) return;
    let cancelled = false;
    (async () => {
      setPersonalContextLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || cancelled) return;
        const ctx = await buildPersonalContext(user.id);
        if (!cancelled) setPersonalContext(ctx);
      } catch {
        if (!cancelled) setPersonalContext(null);
      } finally {
        if (!cancelled) setPersonalContextLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [embedded, serviceId]);

  useEffect(() => {
    if (!serviceId) return;
    try {
      const cached = localStorage.getItem(`bmcore.service.report.${serviceId}`);
      if (!cached) return;
      const parsed = JSON.parse(cached) as { firstOpinion?: string; secondOpinion?: string; question?: string };
      if (parsed.firstOpinion) setFirstOpinion(parsed.firstOpinion);
      if (parsed.secondOpinion) setSecondOpinion(parsed.secondOpinion);
      if (parsed.question) setUserQuestion(parsed.question);
    } catch {
      // ignore cache
    }
  }, [serviceId]);

  useEffect(() => {
    if (!getSnapshotUserId(knowledgeSnapshot)) return;
    const userId = getSnapshotUserId(knowledgeSnapshot);
    if (!userId) return;

    const refreshSnapshot = () => {
      const snapshot = loadKnowledgeSnapshot(userId);
      setKnowledgeSnapshot(snapshot);
    };

    const onStorage = (event: StorageEvent) => {
      if (!event.key) return;
      if (event.key.includes(`bmcore.knowledge.${userId}`)) {
        refreshSnapshot();
      }
    };

    const interval = window.setInterval(refreshSnapshot, 10000);
    window.addEventListener('storage', onStorage);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', onStorage);
    };
  }, [knowledgeSnapshot]);

  useEffect(() => {
    if (!serviceId) return;
    try {
      localStorage.setItem(
        `bmcore.service.report.${serviceId}`,
        JSON.stringify({ firstOpinion, secondOpinion, question: userQuestion, updatedAt: new Date().toISOString() })
      );
    } catch {
      // ignore cache
    }
  }, [serviceId, firstOpinion, secondOpinion, userQuestion]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsSignedIn(!!user);
  };

  if (!serviceId) {
    return (
      <div className="min-h-screen bg-page pt-16 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Service not found</p>
      </div>
    );
  }

  const resolved = resolveServiceRef(serviceId);
  const category = resolved
    ? {
        ...localizeCategory(t, resolved.category),
        services: resolved.category.services.map((item) =>
          localizeService(t, resolved.category.id, item),
        ),
      }
    : undefined;
  const service = category?.services.find((item) => item.id === resolved?.service.id);
  const categoryId = category?.id ?? '';
  const sId = service?.id ?? '';

  if (!category || !service) {
    return (
      <div className="min-h-screen bg-page pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Service not found</p>
          <button
            onClick={() => onNavigate('services-catalog')}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  const serviceFAQs = serviceFAQDatabase[sId] || [
    { question: 'What does this service analyze?', answer: `This service examines ${service.name.toLowerCase()} patterns to provide personalized wellness insights.` },
    { question: 'Why is this helpful?', answer: 'Understanding these patterns helps you make informed decisions about your health routines.' },
    { question: 'When should I use it?', answer: 'Use this whenever you want clarity about this aspect of your health.' },
    { question: 'How often is enough?', answer: 'Find a rhythm that feels supportive - weekly or monthly checks work for most people.' },
    { question: 'Does this replace a doctor?', answer: 'No. This is educational wellness support. Medical concerns require professional consultation.' },
    { question: 'What improves results?', answer: 'Consistent data, honest responses, and regular tracking all create more accurate insights.' }
  ];

  const handleGenerateReport = async () => {
    if (!embedded && !isSignedIn) {
      onNavigate('signin');
      return;
    }

    if (!userQuestion.trim()) {
      notifyUserInfo(t('member.serviceWorkspace.enterQuestion'));
      return;
    }

    setIsGenerating(true);
    setPipelineStep(0);

    const stepTimer = window.setInterval(() => {
      setPipelineStep((prev) => Math.min(prev + 1, 3));
    }, 700);

    setTimeout(async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const userId = user?.id || 'guest';
        const ctx =
          user && embedded
            ? await buildPersonalContext(user.id, { forceRefresh: true })
            : personalContext;
        if (ctx) setPersonalContext(ctx);

        if (user && embedded && ctx && !canGeneratePersonalizedReport(ctx)) {
          notifyUserError(t('member.reports.generateBlocked'));
          onNavigate('questionnaires');
          return;
        }

        let opinionA = '';
        let opinionB = '';

        if (user && embedded) {
          const result = await generatePersonalizedReport({
            userId: user.id,
            reportType: 'thematic',
            topic: service.name,
            serviceName: service.name,
            categoryId,
            userQuestion,
            t,
          });
          if (result.gated) {
            notifyUserError(t('member.reports.generateBlocked'));
            onNavigate('questionnaires');
            return;
          }
          if (!result.ok || !result.content) {
            throw new Error(result.error || 'generate failed');
          }
          if (result.context) setPersonalContext(result.context);
          opinionA = result.content.second_opinion_a || result.content.analysis;
          opinionB = result.content.second_opinion_b || result.content.summary;
          try {
            localStorage.setItem(
              `bmcore.service.report.${serviceId}`,
              JSON.stringify({
                firstOpinion: opinionA,
                secondOpinion: selectedAI === 'ai1' ? '' : opinionB,
                question: userQuestion,
                personalContextSnapshot: result.snapshot || null,
                updatedAt: new Date().toISOString(),
              }),
            );
          } catch {
            /* ignore */
          }
        } else {
          const blurb = ctx?.contextBlurb || t('member.personalContext.statusIncomplete');
          opinionA = `${t('reportTemplate.section.analysis')}\n\n${service.name}\n${userQuestion}\n\n${blurb}`;
          opinionB = `${t('reportTemplate.section.secondOpinionB')}\n\n${service.name}\n${userQuestion}\n\n${blurb}`;
        }

        if (selectedAI === 'both') {
          setFirstOpinion(opinionA);
          setSecondOpinion(opinionB);
          setShowSecondOpinion(true);
        } else if (selectedAI === 'ai1') {
          setFirstOpinion(opinionA);
        } else {
          setFirstOpinion(opinionB);
        }

        const localCounts = estimateLocalSignalCounts();
        const snapshot = addKnowledgeSignals(userId, {
          profile: 1,
          services: 1,
          inputs: Math.max(1, localCounts.inputs || 0),
          reports: Math.max(1, localCounts.reports || 0),
          devices: Math.max(1, localCounts.devices || 0),
          documents: Math.max(1, localCounts.documents || 0),
        });
        setKnowledgeSnapshot(snapshot);
      } catch {
        notifyUserError(t('member.personalContext.generateFailed'));
      } finally {
        window.clearInterval(stepTimer);
        setPipelineStep(3);
        setReportGenerated(true);
        setIsGenerating(false);
      }
    }, 2500);
  };

  const reportExportText = () =>
    [
      `BioMath Core — ${service.name}`,
      `Question: ${userQuestion}`,
      firstOpinion ? `\nFirst Opinion\n${firstOpinion}` : '',
      secondOpinion ? `\nSecond Opinion\n${secondOpinion}` : '',
      aggregatedOpinion?.summary ? `\nUnified Summary\n${aggregatedOpinion.summary}` : '',
      `\nSignature: ${reportSignature}`,
    ]
      .filter(Boolean)
      .join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(reportExportText());
    notifyUserInfo(t('member.serviceWorkspace.reportCopied'));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: service.name,
        text: firstOpinion || service.description,
      });
    } else {
      handleCopy();
    }
  };

  const handleDownload = () => {
    const blob = new Blob([reportExportText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sId || 'service'}-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePdfExport = () => {
    window.print();
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSaveLocalEdit = () => {
    if (draftOpinionA.trim()) {
      setFirstOpinion(draftOpinionA.trim());
    }
    if (draftOpinionB.trim()) {
      setSecondOpinion(draftOpinionB.trim());
      setShowSecondOpinion(true);
    }
    setEditorOpen(false);
  };

  const handleDialogSubmit = () => {
    if (!dialogInput.trim()) return;
    const question = dialogInput.trim();
    const contextNote = personalContext
      ? ` Personal context (${personalContext.completeness.score}%): ${personalContext.contextBlurb}.`
      : '';
    const response = [
      `Based on your service report, here is a concise answer:`,
      firstOpinion || 'No primary opinion generated yet.',
      secondOpinion ? `Second opinion adds: ${secondOpinion}` : '',
      contextNote,
    ].filter(Boolean).join(' ');
    setDialog((prev) => [...prev, { role: 'user', content: question }, { role: 'ai', content: response }]);
    setDialogInput('');
  };

  return (
    <div
      className={`bg-page transition-colors ${
        embedded ? 'min-h-0 pt-0' : 'min-h-screen pt-16'
      }`}
    >
      {!embedded && (
        <SEO
          title={`${service.name} - BioMath Core Service`}
          description={service.description}
          keywords={[service.name.toLowerCase(), 'biomath core service', 'health analytics', 'wellness insights']}
          url={`/services/${categoryId}/${sId}`}
        />
      )}
      <section
        className={`relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8 ${
          embedded
            ? 'rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[var(--bm-surface)]'
            : ''
        }`}
      >
        <div className={`relative z-10 mx-auto ${embedded ? 'max-w-5xl' : 'max-w-4xl'}`}>
          {!embedded && (
            <div className="mb-6 rounded-2xl border border-gray-200 bg-[radial-gradient(circle_at_top,_#fff6ed,_transparent_55%),linear-gradient(135deg,#f8fafc,white)] p-6 dark:border-gray-800 dark:bg-[radial-gradient(circle_at_top,_rgba(120,145,175,0.14),_transparent_55%),linear-gradient(135deg,var(--bm-surface),var(--bm-page))] sm:p-8">
              <button
                type="button"
                onClick={() => (onBack ? onBack() : onNavigate('services-catalog', categoryId))}
                className="mb-6 flex items-center space-x-2 text-orange-600 transition-colors hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>{`Back to ${category.name}`}</span>
              </button>
              <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.2em] ${categoryColors[categoryId] || 'text-orange-500'}`}>
                {category.name}
              </p>
              <h1 className="mb-3 text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {service.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">{service.description}</p>
            </div>
          )}

          {embedded && (
            <button
              type="button"
              onClick={() => (onBack ? onBack() : onNavigate('services-catalog', categoryId))}
              className="mb-6 flex items-center space-x-2 text-orange-600 transition-colors hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>{t('member.serviceWorkspace.backToCatalog')}</span>
            </button>
          )}

          <div className="mb-6">
            {embedded && (
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-wide text-orange-600 dark:text-orange-400">
                  {t('member.workspaceBanner.memberZone')}
                </span>
                <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700 ring-1 ring-orange-200 dark:bg-orange-950/40 dark:text-orange-200 dark:ring-orange-500/30">
                  {t('member.serviceWorkspace.interactiveBadge')}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{category.name}</span>
              </div>
            )}
            {embedded && (
              <>
                <h1 className={`mb-3 text-4xl font-semibold tracking-tight ${categoryColors[categoryId] || 'text-orange-500'}`}>
                  {service.name}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">{service.description}</p>
                <p className="mt-2 text-xs member-muted">{t('member.serviceWorkspace.personalizedNote')}</p>
              </>
            )}
          </div>

          {!embedded && !isSignedIn && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[var(--bm-surface)]">
              <div className="flex items-start space-x-3">
                <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500" />
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                    Sign in to Cabinet to unlock full functionality and generate real reports
                  </h3>
                  <button
                    type="button"
                    onClick={() => onNavigate('signin')}
                    className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          )}

          {embedded && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm dark:border-green-800/40 dark:bg-green-950/30">
              <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                {t('member.serviceWorkspace.unlockedTitle')}
              </p>
              <p className="mt-1 text-xs text-green-700/90 dark:text-green-300/90">
                {t('member.serviceWorkspace.unlockedBody')}
              </p>
            </div>
          )}

          {showPersonalContextIndicator && (
            <div className="mb-6">
              <PersonalContextIndicator
                context={personalContext}
                loading={personalContextLoading}
                compact={isGenerating}
                onOpenQuestionnaires={() => onNavigate('questionnaires')}
              />
            </div>
          )}

          <div className="mb-4 flex flex-wrap gap-2">
            {[
              { id: 'service-ask', label: t('member.serviceWorkspace.tabAsk') },
              { id: 'service-faq', label: t('member.serviceWorkspace.tabFaq') },
              { id: 'service-learn', label: t('member.serviceWorkspace.tabLearn') },
              { id: 'service-report', label: t('member.serviceWorkspace.tabReport') },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-semibold text-orange-700 transition hover:border-orange-400 hover:bg-orange-50 dark:border-orange-500/30 dark:bg-[var(--bm-surface)] dark:text-orange-300 dark:hover:bg-orange-950/40"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Layers className="h-5 w-5 text-blue-600 dark:text-blue-300 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Second Opinion Engine (Multi-Model) is enabled
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Each service runs two coordinated model perspectives and then aggregates them into a unified report.
                </p>
              </div>
            </div>
          </div>

          {/* Ask Your Health Question */}
          <div
            id="service-ask"
            className="mb-6 scroll-mt-24 bg-white dark:bg-[var(--bm-surface)] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <MessageSquareText className="h-5 w-5 text-orange-500" />
              <span>Ask Your Health Question</span>
            </h3>
            <textarea
              value={userQuestion}
              onChange={(e) => {
                setUserQuestion(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              placeholder={`Example: "I've been feeling tired in the afternoons. What could my ${service.name.toLowerCase()} data reveal about this?"`}
              rows={2}
              className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[var(--bm-surface)] text-gray-900 dark:text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none mb-3 resize-none overflow-hidden"
              style={{ minHeight: '48px', maxHeight: '300px' }}
            />

            {/* AI Model Selector - Compact Inline Style */}
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                Second Opinion Engine:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedAI('ai1')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedAI === 'ai1'
                      ? 'bg-orange-500 text-white shadow-md scale-105'
                      : 'bg-white dark:bg-[var(--bm-surface)] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-orange-500'
                  }`}
                >
                  <Brain className="h-3.5 w-3.5" />
                  <span>AI-1</span>
                  <span className="opacity-70">Supportive</span>
                </button>
                <button
                  onClick={() => setSelectedAI('ai2')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedAI === 'ai2'
                      ? 'bg-green-500 text-white shadow-md scale-105'
                      : 'bg-white dark:bg-[var(--bm-surface)] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-green-500'
                  }`}
                >
                  <Scale className="h-3.5 w-3.5" />
                  <span>AI-2</span>
                  <span className="opacity-70">Analytical</span>
                </button>
                <button
                  onClick={() => setSelectedAI('both')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedAI === 'both'
                      ? 'bg-purple-500 text-white shadow-md scale-105'
                      : 'bg-white dark:bg-[var(--bm-surface)] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-500'
                  }`}
                >
                  <GitCompare className="h-3.5 w-3.5" />
                  <span>Multi-Model</span>
                  <span className="opacity-70">Dual + Unified</span>
                </button>
                {multiModelEnabled && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <Layers className="h-3 w-3" />
                    Multi-Model Mode Active
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={isGenerating || !userQuestion.trim()}
              className="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <FileOutput className="h-4 w-4" />
              <span>{isGenerating ? 'Generating Report...' : 'Generate Report'}</span>
            </button>
            {isGenerating && (
              <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-page p-3 text-xs text-gray-600 dark:text-gray-300">
                <p>✓ Gathering signals</p>
                <p>✓ Model A synthesis</p>
                <p>✓ Model B synthesis</p>
                <p className="animate-pulse">⏳ Aggregating unified report</p>
              </div>
            )}
            {isGenerating && (
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                {['Gather Signals', 'Model A', 'Model B', 'Aggregate'].map((label, idx) => (
                  <div
                    key={label}
                    className={`rounded-lg border px-3 py-2 ${
                      pipelineStep > idx
                        ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-700/40 dark:bg-green-900/20 dark:text-green-300'
                        : pipelineStep === idx
                        ? 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-700/40 dark:bg-orange-900/20 dark:text-orange-300'
                        : 'border-gray-200 bg-white text-gray-500 dark:border-gray-800 dark:bg-page dark:text-gray-400'
                    }`}
                  >
                    {pipelineStep > idx ? '✓' : pipelineStep === idx ? '⏳' : '•'} {label}
                  </div>
                ))}
              </div>
            )}
            {isGenerating && (
              <div className="mt-4">
                <div className="h-2 bg-gray-200 dark:bg-[var(--bm-surface)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 transition-all"
                    style={{ width: `${(pipelineStep / 3) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Pipeline progress {Math.round((pipelineStep / 3) * 100)}%
                </p>
              </div>
            )}
          </div>

          {/* FAQ — always visible above the report fold */}
          <div id="service-faq" className="mb-6 max-w-3xl scroll-mt-24">
            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">FAQ</h3>
            <div className="space-y-3">
              {serviceFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[var(--bm-surface)]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFAQ(openFAQ === `faq-${index}` ? null : `faq-${index}`)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-page"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{faq.question}</span>
                    {openFAQ === `faq-${index}` ? (
                      <ChevronUp className="h-4 w-4 flex-shrink-0 text-orange-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    )}
                  </button>
                  {openFAQ === `faq-${index}` && (
                    <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-300">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div id="service-learn" className="mb-6 scroll-mt-24">
            <button
              type="button"
              onClick={() => onNavigate('learning-center', `topic-${sId}`)}
              className="flex w-full items-center justify-center space-x-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-orange-600 shadow-sm transition-all hover:border-orange-500 hover:text-orange-500 dark:border-gray-800 dark:bg-[var(--bm-surface)] dark:text-orange-400"
            >
              <BookOpen className="h-4 w-4" />
              <span>Learn more about {service.name}</span>
            </button>
          </div>

          {!reportGenerated && (
            <div
              id="service-report"
              className="mb-6 scroll-mt-24 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-[var(--bm-surface)] dark:text-gray-300"
            >
              <p className="font-semibold text-gray-900 dark:text-white">Report & second opinion</p>
              <p className="mt-1 text-xs">
                Enter a question above, choose AI-1 / AI-2 / Multi-Model, then Generate Report to unlock dual opinions,
                aggregation, dialog, and export tools.
              </p>
            </div>
          )}

          {/* Report Result */}
          {reportGenerated && (
            <div id="service-report" className="mb-6 scroll-mt-24 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Report</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Generated from your question and selected AI model.
                  </p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Updated just now
                </span>
              </div>
              <ReportBrandHeader
                title="BioMath Core"
                subtitle="Service Report"
                compact
              />
              <div className="bg-white dark:bg-[var(--bm-surface)] border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-[var(--bm-surface)] text-gray-700 dark:text-gray-300">
                    Signature: {reportSignature}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-[var(--bm-surface)] text-gray-700 dark:text-gray-300">
                    Knowledge Score: {knowledgeScore.score}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-[var(--bm-surface)] text-gray-700 dark:text-gray-300">
                    Freshness: {knowledgeScore.freshnessLabel}
                  </span>
                </div>
              </div>
              <div className="bg-white dark:bg-[var(--bm-surface)] border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Pipeline Timeline</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {['Data Gather', 'Model A', 'Model B', 'Aggregation'].map((label, idx) => (
                    <div
                      key={label}
                      className={`rounded-lg border px-3 py-2 ${
                        pipelineStep >= idx
                          ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-700/40 dark:bg-green-900/20 dark:text-green-300'
                          : 'border-gray-200 bg-white text-gray-500 dark:border-gray-800 dark:bg-page dark:text-gray-400'
                      }`}
                    >
                      {pipelineStep >= idx ? '✓' : '•'} {label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setDraftOpinionA(firstOpinion);
                    setDraftOpinionB(secondOpinion);
                    setEditorOpen((prev) => !prev);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-[var(--bm-surface)]"
                >
                  {editorOpen ? 'Close Editor' : 'Edit Report (Local)'}
                </button>
              </div>
              {editorOpen && (
                <div className="bg-white dark:bg-[var(--bm-surface)] border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Local Report Editor</h3>
                  <div className="grid gap-3">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Opinion A</label>
                      <textarea
                        value={draftOpinionA}
                        onChange={(e) => setDraftOpinionA(e.target.value)}
                        rows={4}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[var(--bm-surface)] text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Opinion B</label>
                      <textarea
                        value={draftOpinionB}
                        onChange={(e) => setDraftOpinionB(e.target.value)}
                        rows={4}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[var(--bm-surface)] text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveLocalEdit}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
                      >
                        Save Local Changes
                      </button>
                      <button
                        onClick={() => setEditorOpen(false)}
                        className="px-4 py-2 bg-gray-100 dark:bg-[var(--bm-surface)] text-gray-700 dark:text-gray-200 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-white dark:bg-[var(--bm-surface)] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-bold rounded">
                    {selectedAI === 'ai1' ? 'AI-1' : selectedAI === 'ai2' ? 'AI-2' : 'AI-1'}
                  </span>
                  <span>First Opinion</span>
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                  {firstOpinion}
                </p>
                <button
                  onClick={() => setShowWhySummary((prev) => !prev)}
                  className="mt-3 text-xs text-orange-400 hover:text-orange-300"
                >
                  {showWhySummary ? 'Hide why' : 'Why this opinion?'}
                </button>
                {showWhySummary && knowledgeSnapshot && (
                  <div className="mt-2 text-xs text-gray-400">
                    Derived from {knowledgeSnapshot.sources.map((s) => s.key).join(', ')} with freshness {knowledgeScore.freshnessLabel}.
                  </div>
                )}
              </div>

              {selectedAI !== 'both' && secondOpinion === '' && (
                <div className="text-center">
                  <button
                    onClick={() => {
                      setSecondOpinion(`AI-${selectedAI === 'ai1' ? '2' : '1'} Perspective: Looking at your ${service.name.toLowerCase()} question from another analytical angle:\n\n${userQuestion}\n\nThe patterns confirm stability with room for optimization. Your body's signals indicate positive trajectory.\n\nThis complementary view suggests you're on a good path.`);
                      setShowSecondOpinion(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-[var(--bm-surface)] hover:bg-gray-100 dark:hover:bg-page border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <span>Get Second Opinion</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Need more clarity?</p>
                </div>
              )}

              {(showSecondOpinion || selectedAI === 'both') && secondOpinion && (
                <div className="bg-white dark:bg-[var(--bm-surface)] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded">
                      {selectedAI === 'ai1' ? 'AI-2' : 'AI-1'}
                    </span>
                    <span>Second Opinion</span>
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                    {secondOpinion}
                  </p>
                </div>
              )}

              {aggregatedOpinion && (
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/20 dark:to-blue-900/20 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-600 dark:text-blue-300 text-xs font-bold rounded">
                        Unified
                      </span>
                      <span>Aggregated Report</span>
                    </h3>
                    <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {aggregatedOpinion.consensusLabel} · Conflict {Math.round(aggregatedOpinion.conflictIndex * 100)}%
                    </span>
                  </div>
                  <div className="bg-white dark:bg-[var(--bm-surface)] border border-slate-200 dark:border-slate-800 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {aggregatedOpinion.summary}
                    </p>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <p>{aggregatedOpinion.refinement}</p>
                      <p>{aggregatedOpinion.notes}</p>
                      <p>Confidence: {Math.round(aggregatedOpinion.confidence * 100)}%</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    <div className="bg-white dark:bg-[var(--bm-surface)] border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Model Divergence</p>
                      <div className="h-2 bg-gray-200 dark:bg-[var(--bm-surface)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500"
                          style={{ width: `${Math.round(aggregatedOpinion.conflictIndex * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Conflict {Math.round(aggregatedOpinion.conflictIndex * 100)}%
                      </p>
                    </div>
                    <div className="bg-white dark:bg-[var(--bm-surface)] border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Unified Confidence</p>
                      <div className="h-2 bg-gray-200 dark:bg-[var(--bm-surface)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${Math.round(aggregatedOpinion.confidence * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Confidence {Math.round(aggregatedOpinion.confidence * 100)}%
                      </p>
                    </div>
                  </div>

                  {modelScores && (
                    <div className="bg-white dark:bg-[var(--bm-surface)] border border-slate-200 dark:border-slate-800 rounded-lg p-4 mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Model Comparison Radar
                      </h3>
                      <ModelRadarComparison modelA={modelScores.a} modelB={modelScores.b} />
                    </div>
                  )}

                  {(aggregatedOpinion.agreements.length > 0 || aggregatedOpinion.disagreements.length > 0) && (
                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                      {aggregatedOpinion.agreements.length > 0 && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-200 mb-2">
                            Key Agreements
                          </p>
                          <div className="space-y-2">
                            {aggregatedOpinion.agreements.map((item, idx) => (
                              <p key={idx} className="text-xs text-emerald-900 dark:text-emerald-100">
                                <span className="font-semibold">{item.topic}:</span> {item.consensus}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {aggregatedOpinion.disagreements.length > 0 && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-3">
                          <p className="text-xs font-semibold text-rose-700 dark:text-rose-200 mb-2">
                            Key Disagreements
                          </p>
                          <div className="space-y-2">
                            {aggregatedOpinion.disagreements.map((item, idx) => (
                              <p key={idx} className="text-xs text-rose-900 dark:text-rose-100">
                                <span className="font-semibold">{item.topic}:</span> A: {item.opinionA} · B: {item.opinionB}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {aggregatedOpinion.recommendations.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-200 mb-2">
                        Combined Recommendations
                      </p>
                      <div className="grid md:grid-cols-2 gap-3">
                        {aggregatedOpinion.recommendations.map((rec, idx) => (
                          <div key={idx} className="bg-white dark:bg-[var(--bm-surface)] border border-blue-100 dark:border-blue-900 rounded-lg p-3">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {rec.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                              {rec.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {knowledgeSnapshot && (
                <div className="bg-white dark:bg-[var(--bm-surface)] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Knowledge Snapshot Used
                  </h3>
                  <div className="mb-3 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-[var(--bm-surface)] text-gray-700 dark:text-gray-300">
                      Signal Score: {knowledgeScore.score}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-[var(--bm-surface)] text-gray-700 dark:text-gray-300">
                      Freshness: {knowledgeScore.freshnessLabel}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {knowledgeSnapshot.sources.map((source) => (
                      <span
                        key={source.key}
                        className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-[var(--bm-surface)] dark:text-gray-300"
                      >
                        {source.key.replace('-', ' ')} · {source.count}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Signals continuously refresh as you add new data and reports.
                  </p>
                </div>
              )}

              <div className="bg-white dark:bg-[var(--bm-surface)] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Memory Depth & Coverage</h3>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-300">
                  <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-page p-3">
                    <p className="text-gray-500">Total Signals</p>
                    <p className="text-base font-semibold">{knowledgeSnapshot?.totalSignals || 0}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-page p-3">
                    <p className="text-gray-500">Freshness</p>
                    <p className="text-base font-semibold">{knowledgeScore.freshnessLabel}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-page p-3">
                    <p className="text-gray-500">Reports</p>
                    <p className="text-base font-semibold">
                      {knowledgeSnapshot?.sources.find((s) => s.key === 'reports')?.count || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-page p-3">
                    <p className="text-gray-500">Devices</p>
                    <p className="text-base font-semibold">
                      {knowledgeSnapshot?.sources.find((s) => s.key === 'devices')?.count || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-page p-3">
                    <p className="text-gray-500">Documents</p>
                    <p className="text-base font-semibold">
                      {knowledgeSnapshot?.sources.find((s) => s.key === 'documents')?.count || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-page p-3">
                    <p className="text-gray-500">Inputs</p>
                    <p className="text-base font-semibold">
                      {knowledgeSnapshot?.sources.find((s) => s.key === 'inputs')?.count || 0}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    { key: 'profile', label: 'Profile' },
                    { key: 'devices', label: 'Devices' },
                    { key: 'reports', label: 'Reports' },
                    { key: 'inputs', label: 'Inputs' },
                    { key: 'documents', label: 'Documents' },
                    { key: 'services', label: 'Services' },
                  ].map((item) => {
                    const count = knowledgeSnapshot?.sources.find((s) => s.key === item.key)?.count || 0;
                    return (
                      <div key={item.key} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-page p-3">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{item.label}</span>
                          <span>{count}</span>
                        </div>
                        <div className="mt-2 h-1.5 bg-gray-200 dark:bg-[var(--bm-surface)] rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500" style={{ width: `${Math.min(100, count * 10)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  This service uses your full history: profile, devices, reports, inputs, and documents to deepen understanding.
                </p>
              </div>

              <div className="bg-white dark:bg-[var(--bm-surface)] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">AI Knowledge Gaps</h3>
                {knowledgeGaps.length === 0 ? (
                  <p className="text-xs text-gray-500">No major gaps detected.</p>
                ) : (
                  <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                    {knowledgeGaps.map((gap) => (
                      <div key={gap} className="flex items-center justify-between">
                        <span className="capitalize">{gap.replace('-', ' ')}</span>
                        <span className="text-orange-500">Add data to improve accuracy</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-[var(--bm-surface)] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Ask about this report</h3>
                <div className="space-y-3 mb-4">
                  {dialog.length === 0 && (
                    <p className="text-xs text-gray-500">Ask a question about this service report.</p>
                  )}
                  {dialog.map((msg, idx) => (
                    <div key={idx} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div
                        className={`inline-block px-3 py-2 rounded-lg text-xs ${
                          msg.role === 'user'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 dark:bg-[var(--bm-surface)] text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={dialogInput}
                    onChange={(e) => setDialogInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[var(--bm-surface)] text-gray-900 dark:text-gray-100 text-xs"
                    placeholder="Ask about this report..."
                  />
                  <button
                    onClick={handleDialogSubmit}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs"
                  >
                    Ask
                  </button>
                </div>
              </div>

              {/* Tools Bar */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[var(--bm-surface)] border border-gray-300 dark:border-gray-700 hover:border-orange-500 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-xs rounded-lg transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[var(--bm-surface)] border border-gray-300 dark:border-gray-700 hover:border-orange-500 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-xs rounded-lg transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[var(--bm-surface)] border border-gray-300 dark:border-gray-700 hover:border-orange-500 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-xs rounded-lg transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[var(--bm-surface)] border border-gray-300 dark:border-gray-700 hover:border-orange-500 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-xs rounded-lg transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={handlePdfExport}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-lg transition-colors"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  <span>PDF Export</span>
                </button>
              </div>
            </div>
          )}

          {/* Related Services */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              You may also find helpful
            </h3>
            <div className="grid md:grid-cols-3 gap-3">
              {category.services.filter(s => s.id !== sId).slice(0, 3).map((relatedService) => (
                <button
                  key={relatedService.id}
                  onClick={() => onNavigate('service-detail', serviceDetailPath(categoryId, relatedService.id))}
                  className="group rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:border-orange-300 dark:border-gray-800 dark:bg-[var(--bm-surface)] dark:hover:border-orange-500/40"
                >
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-orange-500 transition-colors flex items-center">
                    {relatedService.name}
                    <ChevronLeft className="h-3 w-3 ml-auto transform rotate-180" />
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {relatedService.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Understanding Block - Moved to Bottom */}
          <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Understanding This Insight
            </h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p>
                <strong>What it means:</strong> This service helps you understand patterns in your {service.name.toLowerCase()}
                and how they relate to your daily wellbeing.
              </p>
              <p>
                <strong>Why it matters:</strong> Your body constantly sends signals. Understanding these signals
                helps you make choices that support your health journey without clinical pressure.
              </p>
              <p>
                <strong>How it supports you:</strong> This insight provides educational context and gentle guidance.
                It's designed to increase clarity and reduce stress, not create urgency.
              </p>
              <div className="mt-3 p-3 bg-white dark:bg-[var(--bm-surface)] rounded-md border border-green-200 dark:border-green-800">
                <p className="mb-1 text-xs font-medium text-green-600 dark:text-green-400">Tip</p>
                <p className="text-xs">
                  Consistency matters more than perfection. Small, regular check-ins help you understand
                  trends over time, which is more valuable than any single data point.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
