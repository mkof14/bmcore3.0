import { useState } from 'react';
import { CheckCircle, AlertCircle, Info, ThumbsUp, ThumbsDown, BookOpen, Brain, Heart } from 'lucide-react';
import type { Report, SecondOpinion, AIModel, OpinionComparison } from '../types/database';

interface SecondOpinionComparisonProps {
  originalReport: Report;
  secondOpinion: SecondOpinion;
  originalModel: AIModel;
  secondModel: AIModel;
  comparison: OpinionComparison | null;
  onPreferenceSelect: (preference: 'original' | 'second' | 'both' | 'neither') => void;
  onRatingSubmit: (rating: number, notes?: string) => void;
}

export default function SecondOpinionComparison({
  originalReport,
  secondOpinion,
  originalModel,
  secondModel,
  comparison,
  onPreferenceSelect,
  onRatingSubmit
}: SecondOpinionComparisonProps) {
  const [selectedPreference, setSelectedPreference] = useState<string | null>(comparison?.user_preferred || null);
  const [rating, setRating] = useState<number>(comparison?.helpful_rating || 0);
  const [notes, setNotes] = useState<string>(comparison?.user_notes || '');

  const handlePreferenceClick = (preference: 'original' | 'second' | 'both' | 'neither') => {
    setSelectedPreference(preference);
    onPreferenceSelect(preference);
  };

  const handleRatingSubmit = () => {
    if (rating > 0) {
      onRatingSubmit(rating, notes);
    }
  };

  const agreements = comparison?.agreements || [];
  const disagreements = comparison?.disagreements || [];
  const keyDifferences = comparison?.key_differences || [];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Second Opinion Analysis
          </h2>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Two AI models analyzed your health data using different reasoning approaches.
          Compare their insights below to gain a more complete understanding.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{originalModel.name_en}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{originalModel.description_en}</p>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                {originalModel.reasoning_style.replace('_', ' ')}
              </span>
              <span>•</span>
              <span>Confidence: {comparison?.confidence_original || 'N/A'}%</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{secondModel.name_en}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{secondModel.description_en}</p>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
              <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded">
                {secondModel.reasoning_style.replace('_', ' ')}
              </span>
              <span>•</span>
              <span>Confidence: {comparison?.confidence_second || 'N/A'}%</span>
            </div>
          </div>
        </div>
      </div>

      {agreements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Agreements ({agreements.length})
            </h3>
          </div>
          <div className="space-y-3">
            {agreements.map((agreement: any, index: number) => (
              <div key={index} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{agreement.topic}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{agreement.consensus}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {disagreements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Disagreements ({disagreements.length})
            </h3>
          </div>
          <div className="space-y-4">
            {disagreements.map((disagreement: any, index: number) => (
              <div key={index} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{disagreement.topic}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                      {originalModel.name_en}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{disagreement.opinion_a}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                      {secondModel.name_en}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{disagreement.opinion_b}</p>
                  </div>
                </div>
                {disagreement.explanation && (
                  <div className="mt-3 pt-3 border-t border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">{disagreement.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {keyDifferences.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3 mb-4">
            <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Key Differences in Approach
            </h3>
          </div>
          <div className="space-y-3">
            {keyDifferences.map((difference: any, index: number) => (
              <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{difference.aspect}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{difference.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Which opinion do you find more helpful?
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => handlePreferenceClick('original')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedPreference === 'original'
                ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
            }`}
          >
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-sm font-semibold text-gray-900 dark:text-white text-center">Opinion A</div>
          </button>
          <button
            onClick={() => handlePreferenceClick('second')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedPreference === 'second'
                ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500'
            }`}
          >
            <Heart className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
            <div className="text-sm font-semibold text-gray-900 dark:text-white text-center">Opinion B</div>
          </button>
          <button
            onClick={() => handlePreferenceClick('both')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedPreference === 'both'
                ? 'border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500'
            }`}
          >
            <ThumbsUp className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <div className="text-sm font-semibold text-gray-900 dark:text-white text-center">Both Helpful</div>
          </button>
          <button
            onClick={() => handlePreferenceClick('neither')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedPreference === 'neither'
                ? 'border-gray-600 dark:border-gray-400 bg-gray-50 dark:bg-[var(--bm-surface)]/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <ThumbsDown className="h-6 w-6 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
            <div className="text-sm font-semibold text-gray-900 dark:text-white text-center">Neither</div>
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rate this Second Opinion feature (1-5 stars)
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl ${
                  star <= rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'
                } hover:text-yellow-400 transition-colors`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--bm-surface)] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            rows={3}
            placeholder="Share any thoughts about the comparison..."
          />
        </div>

        <button
          onClick={handleRatingSubmit}
          disabled={rating === 0}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Feedback
        </button>
      </div>

      <div className="bg-gray-100 dark:bg-[var(--bm-surface)] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">About Second Opinion</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The Second Opinion feature uses two different AI models with distinct reasoning approaches to analyze your health data.
          This provides you with multiple perspectives and helps increase confidence in the insights. Remember that both opinions
          are AI-generated wellness intelligence and should not replace professional medical advice.
        </p>
      </div>
    </div>
  );
}
