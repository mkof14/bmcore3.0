import { useState } from 'react';
import { CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import HealthGuideIcon from './brand/HealthGuideIcon';
import ModalShell from './ui/ModalShell';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface OnboardingData {
  healthGoals: string[];
  focusAreas: string[];
  experience: string;
  devices: string[];
  notificationPreference: string;
}

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: OnboardingData) => void;
}

export default function OnboardingFlow({ isOpen, onClose, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>({
    healthGoals: [] as string[],
    focusAreas: [] as string[],
    experience: '',
    devices: [] as string[],
    notificationPreference: 'daily'
  });

  const healthGoals = [
    'Weight Management',
    'Better Sleep',
    'Stress Reduction',
    'Energy Optimization',
    'Athletic Performance',
    'Chronic Condition Management',
    'Preventive Health',
    'Mental Wellness'
  ];

  const focusAreas = [
    'Cardiovascular Health',
    'Metabolic Health',
    'Mental Health',
    'Sleep Quality',
    'Nutrition',
    'Fitness',
    'Stress Management',
    'Longevity'
  ];

  const devices = [
    'Apple Watch',
    'Fitbit',
    'Garmin',
    'Oura Ring',
    'WHOOP',
    'Continuous Glucose Monitor',
    'Blood Pressure Monitor',
    'Smart Scale'
  ];

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to BioMath Core',
      description: "Let's personalize your health journey",
      icon: <HealthGuideIcon className="w-8 h-8 rounded-lg" size={32} />,
      content: (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6">
            <HealthGuideIcon className="w-20 h-20 rounded-2xl shadow-md" size={80} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to BioMath Core!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            We'll help you set up your personalized health intelligence platform in just a few steps.
            This will take about 2-3 minutes.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">1</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Set Goals</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">2</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Choose Focus</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">3</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Connect Devices</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'goals',
      title: 'What are your health goals?',
      description: 'Select all that apply',
      icon: <CheckCircle className="w-8 h-8 text-orange-500" />,
      content: (
        <div className="py-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            What would you like to achieve?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {healthGoals.map((goal) => (
              <button
                key={goal}
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    healthGoals: prev.healthGoals.includes(goal)
                      ? prev.healthGoals.filter((g) => g !== goal)
                      : [...prev.healthGoals, goal]
                  }));
                }}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  formData.healthGoals.includes(goal)
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center ${
                      formData.healthGoals.includes(goal)
                        ? 'bg-orange-500'
                        : 'border-2 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {formData.healthGoals.includes(goal) && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {goal}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'focus',
      title: 'Choose your focus areas',
      description: 'Select up to 3 areas to prioritize',
      icon: <CheckCircle className="w-8 h-8 text-orange-500" />,
      content: (
        <div className="py-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Which areas do you want to focus on?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select up to 3 ({formData.focusAreas.length}/3 selected)
          </p>
          <div className="grid grid-cols-2 gap-3">
            {focusAreas.map((area) => (
              <button
                key={area}
                onClick={() => {
                  setFormData((prev) => {
                    const isSelected = prev.focusAreas.includes(area);
                    if (isSelected) {
                      return {
                        ...prev,
                        focusAreas: prev.focusAreas.filter((a) => a !== area)
                      };
                    } else if (prev.focusAreas.length < 3) {
                      return {
                        ...prev,
                        focusAreas: [...prev.focusAreas, area]
                      };
                    }
                    return prev;
                  });
                }}
                disabled={!formData.focusAreas.includes(area) && formData.focusAreas.length >= 3}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  formData.focusAreas.includes(area)
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                } ${
                  !formData.focusAreas.includes(area) && formData.focusAreas.length >= 3
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center ${
                      formData.focusAreas.includes(area)
                        ? 'bg-orange-500'
                        : 'border-2 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {formData.focusAreas.includes(area) && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {area}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'devices',
      title: 'Connect your devices',
      description: 'Optional: Link your health tracking devices',
      icon: <CheckCircle className="w-8 h-8 text-orange-500" />,
      content: (
        <div className="py-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Do you use any health tracking devices?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select your devices (you can connect them later)
          </p>
          <div className="grid grid-cols-2 gap-3">
            {devices.map((device) => (
              <button
                key={device}
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    devices: prev.devices.includes(device)
                      ? prev.devices.filter((d) => d !== device)
                      : [...prev.devices, device]
                  }));
                }}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  formData.devices.includes(device)
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center ${
                      formData.devices.includes(device)
                        ? 'bg-orange-500'
                        : 'border-2 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {formData.devices.includes(device) && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {device}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: "You're all set!",
      description: 'Ready to start your health journey',
      icon: <HealthGuideIcon className="w-8 h-8 rounded-lg" size={32} />,
      content: (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            All Set!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            Your personalized health dashboard is ready. You can start exploring services,
            connecting devices, and receiving daily insights.
          </p>
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-orange-800 dark:text-orange-300 font-medium">
              💡 Tip: Complete your health questionnaire to get more personalized recommendations
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) return formData.healthGoals.length > 0;
    if (currentStep === 2) return formData.focusAreas.length > 0;
    return true;
  };

  if (!isOpen) return null;

  return (
    <ModalShell
      title={steps[currentStep].title}
      icon={steps[currentStep].icon}
      onClose={currentStep !== 0 ? onClose : undefined}
      showClose={currentStep !== 0}
      panelClassName="max-w-2xl"
    >
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {steps[currentStep].description}
      </p>

      <div className="flex gap-2 mb-6">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-colors ${
              index <= currentStep
                ? 'bg-orange-500'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      <div className="max-h-[60vh] overflow-y-auto mb-6">
        {steps[currentStep].content}
      </div>

      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`px-6 py-3 font-medium rounded-lg transition-colors inline-flex items-center gap-2 ${
            currentStep === 0
              ? 'invisible'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </ModalShell>
  );
}
