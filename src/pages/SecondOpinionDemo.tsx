import { useState, useEffect } from 'react';
import { Brain, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import SecondOpinionComparison from '../components/SecondOpinionComparison';
import { analyzeOpinions, generateComparisonSummary } from '../lib/opinionAnalyzer';
import { notifyUserSuccess } from '../lib/adminNotify';
import type { Report, SecondOpinion, AIModel, OpinionComparison } from '../types/database';

interface SecondOpinionDemoProps {
  onNavigate: (page: string) => void;
}

export default function SecondOpinionDemo({ onNavigate }: SecondOpinionDemoProps) {
  const [showComparison, setShowComparison] = useState(false);
  const [comparison, setComparison] = useState<OpinionComparison | null>(null);

  const mockOriginalModel: AIModel = {
    id: '1',
    code: 'evidence-primary',
    name_en: 'Opinion A: Evidence-Based',
    name_ru: 'Мнение A: На основе доказательств',
    description_en: 'Strict evidence-based reasoning focused on peer-reviewed research',
    description_ru: 'Строгая логика на основе рецензируемых исследований',
    reasoning_style: 'evidence_based',
    provider: 'openai',
    model_name: 'gpt-4o',
    temperature: 0.3,
    system_prompt: '',
    characteristics: { approach: 'objective', focus: 'research' },
    active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const mockSecondModel: AIModel = {
    id: '2',
    code: 'contextual-secondary',
    name_en: 'Opinion B: Contextual & Adaptive',
    name_ru: 'Мнение B: Контекстное и адаптивное',
    description_en: 'Empathetic reasoning considering lifestyle and behavior patterns',
    description_ru: 'Эмпатическая логика с учетом образа жизни',
    reasoning_style: 'contextual',
    provider: 'anthropic',
    model_name: 'claude-3-5-sonnet',
    temperature: 0.7,
    system_prompt: '',
    characteristics: { approach: 'holistic', focus: 'lifestyle' },
    active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const mockOriginalReport: Report = {
    id: '1',
    user_id: 'demo',
    template_id: 'demo',
    title: 'Sleep & Recovery Analysis',
    status: 'completed',
    input: {},
    output: {
      summary: 'Your sleep metrics indicate moderate sleep quality with room for improvement in deep sleep phases.',
      insights: [
        {
          topic: 'Sleep Duration',
          content: 'Average sleep duration of 6.5 hours is below the recommended 7-9 hours for optimal recovery. Studies show that consistent sleep deprivation correlates with increased cortisol levels and reduced cognitive performance.',
          confidence: 85,
          category: 'sleep'
        },
        {
          topic: 'Deep Sleep',
          content: 'Deep sleep phases represent only 12% of total sleep time, which is below the optimal 15-25%. Research indicates this may impact muscle recovery and memory consolidation.',
          confidence: 82,
          category: 'sleep'
        },
        {
          topic: 'Sleep Consistency',
          content: 'Sleep timing varies by up to 2 hours on weekends. Clinical evidence suggests irregular sleep schedules disrupt circadian rhythm and reduce sleep quality.',
          confidence: 88,
          category: 'sleep'
        }
      ],
      recommendations: [
        {
          text: 'Increase sleep duration to 7.5-8 hours based on age-specific guidelines',
          confidence: 90
        },
        {
          text: 'Maintain consistent sleep schedule within 30-minute window',
          confidence: 85
        }
      ]
    },
    error_message: null,
    version: 1,
    tokens_used: 1200,
    processing_time_ms: 3400,
    has_second_opinion: true,
    ai_model_id: '1',
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString()
  };

  const mockSecondOpinion: SecondOpinion = {
    id: '2',
    original_report_id: '1',
    user_id: 'demo',
    ai_model_id: '2',
    title: 'Sleep & Recovery Analysis - Second Opinion',
    status: 'completed',
    input: {},
    output: {
      summary: 'Your sleep patterns show potential for significant improvement through lifestyle adjustments and stress management.',
      insights: [
        {
          topic: 'Sleep Duration',
          content: 'While 6.5 hours is your current average, consider your energy levels and stress. You might benefit more from quality improvements than just duration. Many people feel more rested with 6.5 high-quality hours than 8 fragmented hours.',
          confidence: 78,
          category: 'sleep'
        },
        {
          topic: 'Deep Sleep',
          content: 'Your deep sleep percentage suggests you may be experiencing elevated stress or late-day stimulant consumption. Consider your evening routine - screen time, caffeine after 2pm, or evening exercise could be factors.',
          confidence: 75,
          category: 'sleep'
        },
        {
          topic: 'Weekend Sleep Pattern',
          content: 'The 2-hour weekend shift likely indicates sleep debt accumulation during the week. This pattern suggests work-life balance adjustments might be more impactful than strict sleep scheduling.',
          confidence: 80,
          category: 'lifestyle'
        }
      ],
      recommendations: [
        {
          text: 'Focus on pre-sleep routine quality: dim lights 1 hour before bed, avoid screens',
          confidence: 82
        },
        {
          text: 'Address root causes of weekday sleep debt rather than compensating on weekends',
          confidence: 85
        }
      ]
    },
    error_message: null,
    tokens_used: 1400,
    processing_time_ms: 3800,
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString()
  };

  useEffect(() => {
    if (showComparison && mockOriginalReport.output && mockSecondOpinion.output) {
      const analysis = analyzeOpinions(
        mockOriginalReport.output,
        mockSecondOpinion.output
      );

      const mockComparison: OpinionComparison = {
        id: '1',
        original_report_id: mockOriginalReport.id,
        second_opinion_id: mockSecondOpinion.id,
        user_id: 'demo',
        agreements: analysis.agreements,
        disagreements: analysis.disagreements,
        key_differences: analysis.keyDifferences,
        confidence_original: analysis.confidenceOriginal,
        confidence_second: analysis.confidenceSecond,
        user_preferred: null,
        user_notes: null,
        helpful_rating: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setComparison(mockComparison);
    }
  }, [showComparison]);

  const handlePreferenceSelect = (preference: 'original' | 'second' | 'both' | 'neither') => {
  };

  const handleRatingSubmit = (rating: number, notes?: string) => {
    notifyUserSuccess('Thank you for your feedback!');
  };

  if (showComparison && comparison) {
    return (
      <div className="min-h-screen bg-page transition-colors pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => setShowComparison(false)}
            className="mb-6 text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to overview
          </button>

          <SecondOpinionComparison
            originalReport={mockOriginalReport}
            secondOpinion={mockSecondOpinion}
            originalModel={mockOriginalModel}
            secondModel={mockSecondModel}
            comparison={comparison}
            onPreferenceSelect={handlePreferenceSelect}
            onRatingSubmit={handleRatingSubmit}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page transition-colors pt-16">
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 dark:bg-blue-500 rounded-full mb-6">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Second Opinion Engine
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Get dual AI perspectives on your health data. Two models, two approaches, deeper understanding.
          </p>
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">Now available in all reports</span>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Generate Report
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create your health report using our primary AI model with evidence-based reasoning
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Request Second Opinion
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get a second analysis using a different AI model with contextual reasoning
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Compare & Decide
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Review agreements, disagreements, and choose which insights resonate with you
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[var(--bm-surface)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Two AI Models, Two Perspectives
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Opinion A
                </h3>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Evidence-Based Reasoning
              </h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                  <span>Strict adherence to peer-reviewed research</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                  <span>Clinical guidelines and statistical data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                  <span>Conservative, objective recommendations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                  <span>Focus on measurable metrics</span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Opinion B
                </h3>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Contextual & Adaptive
              </h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>
                  <span>Considers lifestyle and behavior patterns</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>
                  <span>Empathetic, human-centered approach</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>
                  <span>Practical, personalized insights</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>
                  <span>Holistic wellness perspective</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Try Second Opinion Now
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            See a live demo of how two AI models analyze the same health data
          </p>
          <button
            onClick={() => setShowComparison(true)}
            className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors text-lg"
          >
            <span>View Demo Comparison</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Why Second Opinion Matters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <h3 className="font-semibold text-xl mb-2">Increased Confidence</h3>
              <p className="text-blue-100">When two models agree, you can trust the insights more</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <h3 className="font-semibold text-xl mb-2">Multiple Perspectives</h3>
              <p className="text-blue-100">Different approaches reveal nuances you might miss</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <h3 className="font-semibold text-xl mb-2">Better Decisions</h3>
              <p className="text-blue-100">Choose insights that resonate with your situation</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('signup')}
            className="mt-8 px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-colors"
          >
            Get Started with BioMath Core
          </button>
        </div>
      </section>
    </div>
  );
}
