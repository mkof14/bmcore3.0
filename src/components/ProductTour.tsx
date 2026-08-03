import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface ProductTourProps {
  steps: TourStep[];
  tourId: string;
  autoStart?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

export default function ProductTour({
  steps,
  tourId,
  autoStart = false,
  onComplete,
  onSkip
}: ProductTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem(`tour_${tourId}_completed`);

    if (autoStart && !hasSeenTour) {
      setTimeout(() => setIsActive(true), 1000);
    }
  }, [tourId, autoStart]);

  useEffect(() => {
    if (!isActive) return;

    const step = steps[currentStep];
    if (!step) return;

    const element = document.querySelector(step.target) as HTMLElement;
    if (!element) return;

    setTargetElement(element);
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const rect = element.getBoundingClientRect();
    const tooltipPosition = calculatePosition(rect, step.position || 'bottom');
    setPosition(tooltipPosition);

    element.style.position = 'relative';
    element.style.zIndex = '9999';
    element.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5)';
    element.style.borderRadius = '8px';

    trackEvent('tour_step_viewed', {
      tourId,
      step: currentStep,
      stepTitle: step.title
    });

    return () => {
      element.style.position = '';
      element.style.zIndex = '';
      element.style.boxShadow = '';
      element.style.borderRadius = '';
    };
  }, [isActive, currentStep, steps, tourId]);

  const calculatePosition = (
    rect: DOMRect,
    position: string
  ): { top: number; left: number } => {
    const offset = 20;

    switch (position) {
      case 'top':
        return {
          top: rect.top + window.scrollY - 180,
          left: rect.left + rect.width / 2
        };
      case 'bottom':
        return {
          top: rect.bottom + window.scrollY + offset,
          left: rect.left + rect.width / 2
        };
      case 'left':
        return {
          top: rect.top + window.scrollY + rect.height / 2,
          left: rect.left - 320 - offset
        };
      case 'right':
        return {
          top: rect.top + window.scrollY + rect.height / 2,
          left: rect.right + offset
        };
      default:
        return {
          top: rect.bottom + window.scrollY + offset,
          left: rect.left + rect.width / 2
        };
    }
  };

  const handleNext = () => {
    const step = steps[currentStep];
    if (step.action) {
      step.action();
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`tour_${tourId}_completed`, 'true');
    setIsActive(false);

    trackEvent('tour_completed', {
      tourId,
      totalSteps: steps.length
    });

    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem(`tour_${tourId}_completed`, 'true');
    setIsActive(false);

    trackEvent('tour_skipped', {
      tourId,
      step: currentStep,
      totalSteps: steps.length
    });

    if (onSkip) {
      onSkip();
    }
  };

  if (!isActive || !steps[currentStep]) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={handleSkip}
      />

      <div
        className="fixed z-[10000] bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-80 transform -translate-x-1/2"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`
        }}
      >
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {step.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          {step.content}
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300
                     hover:text-gray-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700
                     text-white rounded-lg font-semibold transition-colors"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Check className="h-4 w-4" />
                <span>Finish</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        <button
          onClick={handleSkip}
          className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400
                   dark:hover:text-gray-200 transition-colors"
        >
          Skip tour
        </button>
      </div>
    </>
  );
}

export const tourSteps = {
  homepage: [
    {
      target: '[data-tour="hero"]',
      title: 'Welcome to BioMath Core',
      content: 'Transform your health data into actionable insights with AI-powered analysis.'
    },
    {
      target: '[data-tour="features"]',
      title: 'Explore Features',
      content: 'Discover our comprehensive health analytics, AI assistant, and personalized reports.'
    },
    {
      target: '[data-tour="pricing"]',
      title: 'Choose Your Plan',
      content: 'Select the perfect plan for your health journey. Start with a 5-day free trial.'
    }
  ],
  memberZone: [
    {
      target: '[data-tour="dashboard"]',
      title: 'My Health',
      content: 'See today\'s health state, your goals, and daily habits in one friendly view.'
    },
    {
      target: '[data-tour="ai-assistant"]',
      title: 'Health Guide',
      content: 'Ask health questions and get personalized guidance from Health Guide.'
    },
    {
      target: '[data-tour="reports"]',
      title: 'Health Reports',
      content: 'Access detailed reports and track your health trends over time.'
    },
    {
      target: '[data-tour="devices"]',
      title: 'Connect Devices',
      content: 'Sync your wearables and health devices for automatic data collection.'
    }
  ]
};
