export interface Service {
  id: string;
  name: string;
  description: string;
  scope?: 'category' | 'human-data-model';
  status?: 'available' | 'planned' | 'integration-required';
  acceptedInputs?: string[];
  outputs?: string[];
  contributesToHumanDataModel?: boolean;
  requiresUserConfirmation?: boolean;
  relatedServiceIds?: string[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  services: Service[];
}

/** Routing / group id for cross-category Human Data Model services — not a 21st medical category. */
export const HUMAN_DATA_MODEL_GROUP_ID = 'human-data-model';

/**
 * Shared Human Data Model services.
 * Not assigned to a single medical category; browsable via this group.
 */
export const humanDataModelServices: Service[] = [
  {
    id: 'medical-records-import',
    name: 'Medical Records Import & Organizer',
    description:
      'Import medical PDFs, images and records, extract key facts, and organize diagnoses, medications, tests, procedures and dates into the Human Data Model.',
    scope: 'human-data-model',
    status: 'available',
    acceptedInputs: ['pdf', 'image', 'medical-record'],
    outputs: ['diagnoses', 'medications', 'lab-results', 'procedures', 'dates', 'source-document'],
    contributesToHumanDataModel: true,
    requiresUserConfirmation: true,
    relatedServiceIds: ['health-timeline', 'what-changed', 'lab-results', 'lab-results-trend'],
  },
  {
    id: 'health-timeline',
    name: 'Health Timeline',
    description:
      'A chronological record of diagnoses, tests, medications, procedures, symptoms, visits and important health changes.',
    scope: 'human-data-model',
    status: 'available',
    acceptedInputs: ['hdm-records', 'confirmed-extractions', 'user-entries'],
    outputs: ['timeline-events', 'source-links', 'conflict-flags', 'duplicates'],
    contributesToHumanDataModel: true,
    requiresUserConfirmation: false,
    relatedServiceIds: ['medical-records-import', 'what-changed', 'doctor-visit-prep'],
  },
  {
    id: 'what-changed',
    name: 'What Changed',
    description:
      'Shows meaningful changes in health records, laboratory results, medications, symptoms and monitored measurements over time.',
    scope: 'human-data-model',
    status: 'available',
    acceptedInputs: ['timeline-events', 'lab-series', 'medication-list', 'symptoms', 'measurements'],
    outputs: ['change-events', 'source-links', 'significance-flags'],
    contributesToHumanDataModel: true,
    requiresUserConfirmation: false,
    relatedServiceIds: ['health-timeline', 'lab-results-trend', 'medication-reconciliation'],
  },
];

/** Synthetic browse group for shared HDM services — kept outside serviceCategories (still 20 categories). */
export const humanDataModelCategory: ServiceCategory = {
  id: HUMAN_DATA_MODEL_GROUP_ID,
  name: 'Human Data Model',
  description:
    'Cross-category tools that import, organize and track health information in the Human Data Model.',
  icon: 'Database',
  services: humanDataModelServices,
};

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'critical-health',
    name: 'Critical Health',
    description: 'Advanced health monitoring and risk assessment for critical medical conditions',
    icon: 'Heart',
    services: [
      { id: 'risk-insight', name: 'Risk Insight', description: 'Comprehensive health risk assessment using biomathematical models' },
      { id: 'lab-results', name: 'Lab Results Explainer', description: 'AI-powered interpretation of laboratory test results' },
      {
        id: 'lab-results-trend',
        name: 'Lab Results Trend',
        description:
          'Compare laboratory results over time and identify meaningful changes, repeated abnormalities and missing follow-up tests.',
        scope: 'category',
        status: 'available',
        acceptedInputs: ['lab-reports', 'prior-results'],
        outputs: ['trend-series', 'abnormality-flags', 'missing-follow-up', 'source-links'],
        contributesToHumanDataModel: true,
        requiresUserConfirmation: false,
        relatedServiceIds: ['lab-results', 'what-changed', 'medical-records-import'],
      },
      { id: 'drug-interaction', name: 'Drug-Drug Interaction Checker', description: 'Real-time medication interaction analysis' },
      {
        id: 'medication-reconciliation',
        name: 'Medication Reconciliation',
        description:
          'Create one confirmed medication list from prescriptions, medical records and user entries, and identify duplicates, conflicts and outdated instructions.',
        scope: 'category',
        status: 'available',
        acceptedInputs: ['prescriptions', 'medical-records', 'user-entries', 'otc', 'supplements', 'allergies'],
        outputs: ['confirmed-medication-list', 'duplicate-flags', 'dosage-conflicts', 'source-attribution'],
        contributesToHumanDataModel: true,
        requiresUserConfirmation: true,
        relatedServiceIds: ['drug-interaction', 'medication-adherence', 'medical-records-import'],
      },
      { id: 'symptom-analyzer', name: 'Symptom Analyzer', description: 'Intelligent symptom assessment and triage' },
      { id: 'chronic-disease', name: 'Chronic Disease Coach', description: 'Personalized management for chronic conditions' },
      { id: 'medication-adherence', name: 'AI Medication Adherence', description: 'Smart medication tracking and reminders' },
      { id: 'care-cost', name: 'Care Cost Optimizer', description: 'Healthcare cost analysis and optimization' },
      {
        id: 'doctor-visit-prep',
        name: 'Doctor Visit Prep',
        description:
          'Prepare a concise visit summary with the reason for the appointment, recent changes, current medications, relevant results, symptoms and questions.',
        scope: 'category',
        status: 'available',
        acceptedInputs: ['timeline-events', 'medications', 'lab-results', 'symptoms', 'visit-reason'],
        outputs: ['visit-summary', 'question-list', 'print-export', 'post-visit-notes'],
        contributesToHumanDataModel: true,
        requiresUserConfirmation: true,
        relatedServiceIds: ['health-timeline', 'what-changed', 'medication-reconciliation'],
      },
      {
        id: 'prescription-price-comparison',
        name: 'Prescription Price Comparison',
        description:
          'Compare available prices for a prescribed medication by pharmacy, generic option, dosage and payment method.',
        scope: 'category',
        status: 'integration-required',
        acceptedInputs: ['medication-name', 'dosage', 'quantity', 'location'],
        outputs: ['price-comparisons', 'generic-options', 'data-source', 'update-time'],
        contributesToHumanDataModel: false,
        requiresUserConfirmation: false,
        relatedServiceIds: ['medication-reconciliation', 'med-refill', 'care-cost'],
      },
      { id: 'post-surgery', name: 'Post-Surgery Recovery Tracker', description: 'Recovery monitoring and guidance' },
      { id: 'clinical-trial', name: 'Clinical Trial Finder', description: 'Personalized clinical trial matching' },
      { id: 'pre-surgery', name: 'Pre-Surgery Readiness', description: 'Surgical preparation assessment' },
      { id: 'rare-disease', name: 'Rare Disease Navigator', description: 'Support for rare condition management' },
      { id: 'med-refill', name: 'Smart Med Refill', description: 'Automated prescription refill management' },
      { id: 'pain-map', name: 'AI Pain Map', description: 'Pain tracking and pattern analysis' },
      { id: 'vaccination', name: 'Vaccination Passport', description: 'Digital immunization records' },
      { id: 'post-covid', name: 'Post-COVID Planner', description: 'Long COVID recovery planning' },
      { id: 'genetic-risk', name: 'Genetic Disease Risk Prediction', description: 'Genomic risk assessment' },
      { id: 'emergency-profile', name: 'Emergency Medical Profile', description: 'Quick-access emergency health information' },
      { id: 'remote-vitals', name: 'Remote Vitals Monitoring', description: 'Continuous vital signs tracking' }
    ]
  },
  {
    id: 'everyday-wellness',
    name: 'Everyday Wellness',
    description: 'Daily health optimization and wellness practices',
    icon: 'Sun',
    services: [
      { id: 'travel-kit', name: 'Healthy Travel Kit', description: 'Travel health preparation and tips' },
      { id: 'goal-assistant', name: 'Goal Assistant', description: 'Health goal setting and tracking' },
      { id: 'habit-tracker', name: 'Daily Habit Tracker', description: 'Build and maintain healthy habits' },
      { id: 'stress-reduction', name: 'Stress Reduction Guide', description: 'Evidence-based stress management' },
      { id: 'energy-optimizer', name: 'Energy Level Optimizer', description: 'Boost and sustain daily energy' },
      { id: 'mind-body', name: 'Mind-Body Connection Exercises', description: 'Holistic wellness practices' },
      { id: 'affirmations', name: 'Positive Affirmation Generator', description: 'Personalized positive messaging' },
      { id: 'gratitude', name: 'Gratitude Journal Prompts', description: 'Daily gratitude practice' },
      { id: 'digital-wellbeing', name: 'Digital Wellbeing Score', description: 'Technology usage optimization' },
      { id: 'mindful-eating', name: 'Mindful Eating Assistant', description: 'Conscious eating practices' },
      { id: 'work-life', name: 'Work-Life Balance Advisor', description: 'Balance optimization strategies' },
      { id: 'immunity-booster', name: 'Immunity Booster Plan', description: 'Immune system strengthening' },
      { id: 'breathing', name: 'Mindful Breathing Exercises', description: 'Guided breathing techniques' },
      { id: 'ergonomic', name: 'Ergonomic Workspace Setup', description: 'Workspace health optimization' },
      { id: 'social-connection', name: 'Social Connection Tracker', description: 'Social wellness monitoring' }
    ]
  },
  {
    id: 'longevity',
    name: 'Longevity & Anti-Aging',
    description: 'Advanced aging science and lifespan optimization',
    icon: 'Hourglass',
    services: [
      { id: 'biological-age', name: 'Biological Age Factors', description: 'True biological age assessment' },
      { id: 'polygenic-risk', name: 'Polygenic Risk Viewer', description: 'Multi-gene health risk analysis' },
      { id: 'epigenetic-age', name: 'Epigenetic Age Dashboard', description: 'DNA methylation age tracking' },
      { id: 'pharmacogenomics', name: 'Pharmacogenomics Matcher', description: 'Genetic medication compatibility' },
      { id: 'genetic-traits', name: 'Genetic Trait Explainer', description: 'Understanding your genetic makeup' },
      { id: 'telomere', name: 'Telomere Length Analysis', description: 'Cellular aging biomarker' },
      { id: 'nad-optimization', name: 'NAD+ Optimization Guide', description: 'Cellular energy enhancement' },
      { id: 'senolytics', name: 'Senolytics Recommendation', description: 'Cellular senescence intervention' },
      { id: 'mitochondrial', name: 'Mitochondrial Health Assessment', description: 'Cellular powerhouse optimization' },
      { id: 'longevity-diet', name: 'Longevity Diet Planner', description: 'Nutrition for extended healthspan' },
      { id: 'glycemic-control', name: 'Glycemic Control Advisor', description: 'Blood sugar optimization' },
      { id: 'cellular-senescence', name: 'Cellular Senescence Score', description: 'Aging cell accumulation tracking' },
      { id: 'microbiome', name: 'Microbiome Diversity Analysis', description: 'Gut health longevity connection' },
      { id: 'gene-expression', name: 'Longevity Gene Expression Report', description: 'Aging-related gene activity' },
      { id: 'organ-age', name: 'Organ Age Assessment', description: 'Individual organ aging analysis' }
    ]
  },
  {
    id: 'mental-wellness',
    name: 'Mental Wellness',
    description: 'Psychological health and cognitive optimization',
    icon: 'Brain',
    services: [
      { id: 'mindfulness', name: 'Mindfulness Guide', description: 'Meditation and awareness practices' },
      { id: 'motivation', name: 'Motivation Booster', description: 'Psychological drive enhancement' },
      { id: 'digital-detox', name: 'Digital Detox Planner', description: 'Technology break strategies' },
      { id: 'gratitude-wall', name: 'Digital Gratitude Wall', description: 'Community appreciation sharing' },
      { id: 'social-battery', name: 'Social Battery Prediction', description: 'Social energy management' },
      { id: 'isolation-coach', name: 'Social Isolation Coach', description: 'Connection building support' },
      { id: 'cognitive-performance', name: 'Cognitive Performance Enhancer', description: 'Mental sharpness optimization' },
      { id: 'emotional-regulation', name: 'Emotional Regulation Tools', description: 'Emotion management techniques' },
      { id: 'cbt-modules', name: 'Cognitive Behavioral Therapy (CBT) Modules', description: 'Evidence-based therapy exercises' },
      { id: 'stress-hormone', name: 'Stress Hormone Tracker', description: 'Cortisol and stress biomarkers' },
      { id: 'sleep-mood', name: 'Sleep-Mood Connection Analysis', description: 'Rest-emotion relationship tracking' }
    ]
  },
  {
    id: 'fitness-performance',
    name: 'Fitness & Performance',
    description: 'Athletic training and physical optimization',
    icon: 'Dumbbell',
    services: [
      { id: 'meal-plan', name: 'Personalized Meal Plan', description: 'Custom nutrition for your goals' },
      { id: 'vo2-max', name: 'VO₂-Max Assessment', description: 'Aerobic capacity measurement' },
      { id: 'workout-generator', name: 'Workout Generator', description: 'AI-powered training programs' },
      { id: 'plateau-breaker', name: 'Strength Plateau Breaker', description: 'Overcome training stagnation' },
      { id: 'tissue-release', name: 'Soft Tissue Release Map', description: 'Myofascial release guidance' },
      { id: 'body-fat', name: 'Body Fat Trend Projection', description: 'Composition prediction modeling' },
      { id: 'sport-warmup', name: 'Sport Specific Warm-up', description: 'Activity-tailored preparation' },
      { id: 'cycling-power', name: 'Cycling Power Prediction', description: 'Performance forecasting' },
      { id: 'hrv-breathwork', name: '2-Minute HRV Breathwork', description: 'Quick recovery breathing' },
      { id: 'active-recovery', name: 'Active Recovery Timer', description: 'Optimized rest periods' },
      { id: 'desk-stretch', name: 'Desk Stretch Breaks', description: 'Workplace mobility routines' },
      { id: 'soft-tissue-map', name: 'Soft Tissue Map', description: 'Muscular health visualization' },
      { id: 'endurance-plan', name: 'Endurance Training Plan', description: 'Long-distance performance' },
      { id: 'flexibility', name: 'Flexibility & Mobility Guide', description: 'Range of motion improvement' },
      { id: 'post-workout', name: 'Post-Workout Nutrition Guide', description: 'Recovery nutrition timing' },
      { id: 'injury-prevention', name: 'Injury Prevention Plan', description: 'Proactive injury avoidance' },
      { id: 'strength-conditioning', name: 'Strength & Conditioning Coach', description: 'Comprehensive training' },
      { id: 'powerlifting', name: 'Powerlifting Program Generator', description: 'Maximal strength development' },
      { id: 'gait-analysis', name: 'Running Gait Analysis', description: 'Running form optimization' }
    ]
  },
  {
    id: 'womens-health',
    name: "Women's Health",
    description: 'Specialized healthcare for women',
    icon: 'Heart',
    services: [
      { id: 'cycle-tracker', name: 'Cycle Tracker', description: 'Menstrual cycle monitoring and prediction' },
      { id: 'pregnancy', name: 'Pregnancy Timeline', description: 'Week-by-week pregnancy guidance' },
      { id: 'menopause', name: 'Menopause Navigator', description: 'Transition support and management' },
      { id: 'breast-health', name: 'Breast-Health Risk', description: 'Screening and risk assessment' },
      { id: 'hormone-dashboard', name: 'Hormone Dashboard', description: 'Female hormone tracking' },
      { id: 'endometriosis', name: 'Endometriosis Symptom Tracker', description: 'Condition management support' },
      { id: 'pcos', name: 'Polycystic Ovary Syndrome (PCOS) Guide', description: 'PCOS lifestyle optimization' },
      { id: 'pelvic-floor', name: 'Pelvic Floor Exercise Plan', description: 'Strengthening and rehabilitation' }
    ]
  },
  {
    id: 'mens-health',
    name: "Men's Health",
    description: 'Specialized healthcare for men',
    icon: 'User',
    services: [
      { id: 'androgen', name: 'Androgen Dashboard', description: 'Male hormone monitoring' },
      { id: 'prostate-risk', name: 'Prostate Risk Score', description: 'Prostate health assessment' },
      { id: 'fertility-tracker', name: 'Fertility Tracker', description: 'Male fertility optimization' },
      { id: 'hair-loss', name: 'Hair-Loss Predictor', description: 'Androgenic alopecia tracking' },
      { id: 'performance-coach', name: 'Performance Coach', description: 'Male vitality optimization' },
      { id: 'cardiovascular-risk', name: 'Cardiovascular Risk for Men', description: 'Heart health screening' },
      { id: 'hormone-optimization', name: 'Male Hormone Optimization', description: 'Testosterone balance' },
      { id: 'prostate-health', name: 'Prostate Health Coach', description: 'Proactive prostate care' }
    ]
  },
  {
    id: 'beauty-skincare',
    name: 'Beauty & Skincare',
    description: 'Dermatological health and cosmetic optimization',
    icon: 'Droplets',
    services: [
      { id: 'skincare-routine', name: 'AI Skincare Routine', description: 'Personalized skincare regimen' },
      { id: 'uv-forecast', name: 'UV Damage Forecast', description: 'Sun exposure risk prediction' },
      { id: 'dermatology-scan', name: 'Digital Dermatology Scan', description: 'AI skin condition analysis' },
      { id: 'hair-porosity', name: 'Hair Porosity Advisor', description: 'Hair care optimization' },
      { id: 'cosmetic-scan', name: 'Cosmetic Barcode Scan', description: 'Product ingredient analysis' },
      { id: 'facial-massage', name: 'Facial Massage Routine', description: 'Lymphatic drainage techniques' },
      { id: 'ingredient-conflict', name: 'Ingredient Conflict', description: 'Product compatibility checker' },
      { id: 'hair-growth', name: 'Hair Growth Predictor', description: 'Growth timeline estimation' },
      { id: 'anti-aging-skincare', name: 'Anti-Aging Skincare Advisor', description: 'Age-defying strategies' },
      { id: 'sunscreen', name: 'Sunscreen Recommendation Engine', description: 'SPF product matching' }
    ]
  },
  {
    id: 'nutrition-diet',
    name: 'Nutrition & Diet',
    description: 'Evidence-based nutrition and dietary optimization',
    icon: 'Apple',
    services: [
      { id: 'food-swaps', name: 'Smart Food Swaps', description: 'Healthier alternative suggestions' },
      { id: 'rpm', name: 'Remote Patient Monitoring (RPM)', description: 'Nutritional intervention tracking' },
      { id: 'hydration', name: 'Hydration Formula', description: 'Personalized water intake goals' },
      { id: 'label-decoder', name: 'Nutrition Label Decoder', description: 'Food label interpretation' },
      { id: 'meal-kit', name: 'Budget Meal Kit Builder', description: 'Affordable nutrition planning' },
      { id: 'sodium-potassium', name: 'Sodium-Potassium Meter', description: 'Electrolyte balance tracking' },
      { id: 'gut-microbiome', name: 'Gut Microbiome Analyzer', description: 'Digestive health assessment' },
      { id: 'supplement-guide', name: 'Personalized Supplement Guide', description: 'Evidence-based supplementation' },
      { id: 'metabolic-rate', name: 'Metabolic Rate Calculator', description: 'Caloric needs estimation' },
      { id: 'food-sensitivity', name: 'Food Sensitivity Tracker', description: 'Intolerance identification' },
      { id: 'electrolyte', name: 'Electrolyte Balance Advisor', description: 'Mineral optimization' },
      { id: 'sustainability', name: 'Food Sustainability Score', description: 'Environmental impact tracking' },
      { id: 'meal-prep', name: 'Meal Prep Planner', description: 'Weekly meal preparation' },
      { id: 'recipe-analyzer', name: 'Recipe Nutrient Analyzer', description: 'Recipe nutritional breakdown' },
      { id: 'hydration-goal', name: 'Hydration Goal Setter', description: 'Daily fluid intake planning' }
    ]
  },
  {
    id: 'sleep-recovery',
    name: 'Sleep & Recovery',
    description: 'Sleep optimization and recovery enhancement',
    icon: 'Moon',
    services: [
      { id: 'blue-light', name: 'Blue Light Planner', description: 'Light exposure optimization' },
      { id: 'sleep-hygiene', name: 'Sleep Hygiene Coach', description: 'Sleep environment improvement' },
      { id: 'circadian-light', name: 'Circadian Light Guide', description: 'Natural rhythm alignment' },
      { id: 'sleep-apnea', name: 'Sleep Apnea Screener', description: 'Breathing disorder detection' },
      { id: 'micro-meditation', name: 'Micro-Meditation Generator', description: 'Quick relaxation exercises' },
      { id: 'sleep-environment', name: 'Sleep Environment Optimizer', description: 'Bedroom optimization' },
      { id: 'guided-sleep', name: 'Guided Sleep Meditation', description: 'Audio sleep assistance' },
      { id: 'dream-analysis', name: 'Dream Pattern Analysis', description: 'Sleep quality insights' }
    ]
  },
  {
    id: 'environmental-health',
    name: 'Environmental Health',
    description: 'Environmental exposure monitoring and mitigation',
    icon: 'Leaf',
    services: [
      { id: 'eco-routine', name: 'Eco-Routine Assessment', description: 'Environmental impact evaluation' },
      { id: 'environmental-exposure', name: 'Environmental Exposure', description: 'Toxin exposure tracking' },
      { id: 'pollen-defense', name: 'Pollen Defense', description: 'Allergy season preparation' },
      { id: 'noise-map', name: 'Indoor Noise Map', description: 'Sound pollution assessment' },
      { id: 'commute-calorie', name: 'Commute Calorie Optimizer', description: 'Active transportation planning' },
      { id: 'air-quality', name: 'Home Air Quality Advisor', description: 'Indoor air monitoring' },
      { id: 'water-quality', name: 'Water Quality Monitor', description: 'Drinking water assessment' },
      { id: 'mold-exposure', name: 'Mold Exposure Risk Assessment', description: 'Fungal contamination detection' }
    ]
  },
  {
    id: 'family-health',
    name: 'Family Health',
    description: 'Comprehensive family healthcare management',
    icon: 'Users',
    services: [
      { id: 'medication-hub', name: 'Family Medication Hub', description: 'Household medication tracking' },
      {
        id: 'family-caregiver-access',
        name: 'Family & Caregiver Access',
        description:
          'Permission-based access for managing selected health information and tasks for a child, spouse, parent or dependent adult.',
        scope: 'category',
        status: 'available',
        acceptedInputs: ['person-profiles', 'relationships', 'permissions'],
        outputs: ['access-grants', 'shared-medications', 'shared-appointments', 'shared-results', 'emergency-info', 'audit-log'],
        contributesToHumanDataModel: true,
        requiresUserConfirmation: true,
        relatedServiceIds: ['medication-hub', 'emergency-profile', 'doctor-visit-prep'],
      },
      { id: 'child-growth', name: 'Child Growth Tracker', description: 'Pediatric development monitoring' },
      { id: 'genetic-compatibility', name: 'Genetic Compatibility Screening', description: 'Family planning insights' },
      { id: 'wellness-challenge', name: 'Family Wellness Challenge', description: 'Group health goals' },
      { id: 'immunization', name: 'Child Immunization Scheduler', description: 'Vaccination timeline' },
      { id: 'first-aid', name: 'Family First-Aid Guide', description: 'Emergency response protocols' },
      { id: 'sibling-comparison', name: 'Sibling Health Comparison', description: 'Developmental benchmarking' }
    ]
  },
  {
    id: 'preventive-medicine',
    name: 'Preventive Medicine & Longevity',
    description: 'Proactive disease prevention and health optimization',
    icon: 'Shield',
    services: [
      { id: 'cancer-screening', name: 'Personalized Cancer Screening', description: 'Risk-based screening protocols' },
      {
        id: 'preventive-care-due',
        name: 'Preventive Care Due',
        description:
          'Shows preventive screenings, vaccinations and follow-up checks that are due, upcoming or completed based on the user’s confirmed profile and records.',
        scope: 'category',
        status: 'available',
        acceptedInputs: ['profile', 'age', 'sex', 'history', 'records', 'vaccinations'],
        outputs: ['overdue-items', 'due-soon-items', 'completed-items', 'guideline-source', 'rationale'],
        contributesToHumanDataModel: true,
        requiresUserConfirmation: true,
        relatedServiceIds: ['cancer-screening', 'vaccination', 'immunization', 'health-timeline'],
      },
      { id: 'cardiovascular-prevention', name: 'Cardiovascular Disease Prevention Plan', description: 'Heart health optimization' },
      { id: 'neurodegenerative', name: 'Neurodegenerative Risk Assessment', description: 'Brain health protection' },
      { id: 'inflammation-management', name: 'Inflammation Management Program', description: 'Systemic inflammation reduction' },
      { id: 'immune-optimization', name: 'Immune System Optimization', description: 'Immune function enhancement' },
      { id: 'risk-calculator', name: 'Health & Wellness Risk Calculator', description: 'Comprehensive risk assessment' },
      { id: 'diabetes-prevention', name: 'Diabetes Prevention Program', description: 'Blood sugar management' },
      { id: 'metabolic-syndrome', name: 'Metabolic Syndrome Monitor', description: 'Metabolic health tracking' }
    ]
  },
  {
    id: 'biohacking',
    name: 'Biohacking & Performance',
    description: 'Advanced human performance optimization',
    icon: 'Zap',
    services: [
      { id: 'nootropics', name: 'Nootropic Recommendation Engine', description: 'Cognitive enhancer guidance' },
      { id: 'cryotherapy', name: 'Cryotherapy Protocol Generator', description: 'Cold therapy optimization' },
      { id: 'red-light', name: 'Red Light Therapy Guide', description: 'Photobiomodulation protocols' },
      { id: 'cold-exposure', name: 'Cold Exposure Training Plan', description: 'Hormetic stress adaptation' },
      { id: 'intermittent-fasting', name: 'Intermittent Fasting Schedule', description: 'Time-restricted eating' },
      { id: 'biofeedback', name: 'Biofeedback Training Modules', description: 'Physiological self-regulation' },
      { id: 'neurofeedback', name: 'Neurofeedback Session Planner', description: 'Brainwave optimization' },
      { id: 'wearable-integrator', name: 'Wearable Data Integrator', description: 'Multi-device data synthesis' },
      { id: 'recovery-modalities', name: 'Personalized Recovery Modalities', description: 'Custom recovery protocols' },
      { id: 'nootropic-stack', name: 'Nootropic Stack Builder', description: 'Supplement synergy optimization' },
      { id: 'cold-protocol', name: 'Cold Exposure Protocol', description: 'Ice bath and cold shower guidance' },
      { id: 'breathwork-optimizer', name: 'Breathwork Optimizer', description: 'Advanced breathing techniques' },
      { id: 'cognitive-enhancement', name: 'Cognitive Enhancement Plan', description: 'Mental performance boosting' },
      { id: 'fasting-calculator', name: 'Intermittent Fasting Calculator', description: 'Fasting window optimization' },
      { id: 'dopamine-reset', name: 'Dopamine Reset Protocol', description: 'Neurotransmitter rebalancing' },
      { id: 'sensory-deprivation', name: 'Sensory Deprivation Guide', description: 'Float tank protocols' },
      { id: 'biofeedback-focus', name: 'Biofeedback Training for Focus', description: 'Attention enhancement' }
    ]
  },
  {
    id: 'senior-care',
    name: 'Senior Care',
    description: 'Specialized healthcare for older adults',
    icon: 'Users',
    services: [
      { id: 'senior-dashboard', name: 'Senior Dashboard', description: 'Comprehensive elder health monitoring' },
      { id: 'caregiver-portal', name: 'Caregiver Portal', description: 'Family caregiver coordination' },
      { id: 'fall-detection', name: 'Fall Detection Alert', description: 'Emergency fall response' },
      { id: 'medication-adherence-senior', name: 'Medication Adherence', description: 'Senior medication management' },
      { id: 'voice-companion', name: 'Voice Companion', description: 'AI health assistant for seniors' },
      { id: 'frailty-index', name: 'Frailty Index', description: 'Physical decline assessment' },
      { id: 'medication-reminder', name: 'Medication Reminder System', description: 'Automated pill reminders' },
      { id: 'fall-prevention', name: 'Fall Prevention Exercises', description: 'Balance and strength training' },
      { id: 'cognitive-games', name: 'Cognitive Health Games', description: 'Brain training for seniors' }
    ]
  },
  {
    id: 'eye-health',
    name: 'Eye-Health Suite',
    description: 'Visual health monitoring and optimization',
    icon: 'Eye',
    services: [
      { id: 'vision-test', name: 'Browser Vision Test', description: 'Online visual acuity testing' },
      { id: 'retina-scan', name: 'Retina Scan AI', description: 'Retinal health analysis' },
      { id: 'blue-light-filter', name: 'Blue Light Filter', description: 'Digital eye strain reduction' },
      { id: 'eye-exercises', name: 'Eye Exercise Reminders', description: 'Visual fatigue prevention' }
    ]
  },
  {
    id: 'digital-therapeutics',
    name: 'Digital Therapeutics Store',
    description: 'Evidence-based digital health interventions',
    icon: 'Tablet',
    services: [
      { id: 'insomnia-cbt', name: 'Insomnia CBT-I App', description: 'Cognitive behavioral therapy for insomnia' },
      { id: 'adhd-game', name: 'ADHD Neuro-Game', description: 'Attention training for ADHD' },
      { id: 'anxiety-app', name: 'Anxiety Management App', description: 'Evidence-based anxiety relief' },
      { id: 'pain-relief-vr', name: 'Chronic Pain Relief VR', description: 'Virtual reality pain management' },
      { id: 'ptsd-modules', name: 'PTSD Recovery Modules', description: 'Trauma recovery support' }
    ]
  },
  {
    id: 'general-sexual',
    name: 'General Sexual Longevity',
    description: 'Comprehensive sexual health and wellness optimization',
    icon: 'Fingerprint',
    services: [
      { id: 'libido-optimization', name: 'Libido Hormonal Optimization', description: 'Hormone balance for sexual health' },
      { id: 'sexual-biomarkers', name: 'Sexual Health Biomarkers', description: 'Key health indicators tracking' },
      { id: 'aphrodisiac-nutrigenomics', name: 'Aphrodisiac Nutrigenomics', description: 'Genetic-based libido nutrition' },
      { id: 'microbiome-sexuality', name: 'Microbiome and Sexuality', description: 'Gut health sexual connection' },
      { id: 'neuroplasticity-libido', name: 'Neuroplasticity and Libido', description: 'Brain training for desire' },
      { id: 'stress-cortisol', name: 'Stress and Cortisol Management', description: 'Stress hormone optimization' },
      { id: 'circadian-sexuality', name: 'Circadian Rhythms and Sexuality', description: 'Timing sexual wellness' },
      { id: 'physical-fitness-sexuality', name: 'Physical Fitness for Sexuality', description: 'Exercise for sexual health' },
      { id: 'peptide-therapy', name: 'Peptide Therapy for Libido', description: 'Advanced peptide protocols' },
      { id: 'xenoestrogen-detox', name: 'Xenoestrogen Detoxification', description: 'Hormone disruptor elimination' },
      { id: 'psychosexual', name: 'Psychosexual Optimization', description: 'Mental sexual health enhancement' },
      { id: 'partner-sync', name: 'Partner Synchronization', description: 'Couple health coordination' },
      { id: 'fertility-assessment', name: 'Fertility Health Assessment', description: 'Reproductive health evaluation' },
      { id: 'hormone-balance-libido', name: 'Hormone Balance for Libido', description: 'Endocrine optimization' },
      { id: 'sexual-wellness-education', name: 'Sexual Wellness Education', description: 'Comprehensive sex education' },
      { id: 'relationship-communication', name: 'Relationship Communication Coach', description: 'Intimacy communication skills' }
    ]
  },
  {
    id: 'mens-sexual-health',
    name: "Men's Sexual Health",
    description: 'Specialized sexual wellness for men',
    icon: 'Target',
    services: [
      { id: 'vascular-health', name: 'Vascular Health for Potency', description: 'Circulatory sexual function' },
      { id: 'male-vitality-trt', name: 'Male Vitality and TRT', description: 'Testosterone replacement therapy' },
      { id: 'ed-guide', name: 'Erectile Dysfunction (ED) Guide', description: 'Comprehensive ED management' },
      { id: 'sperm-health', name: 'Sperm Health Optimization', description: 'Male fertility enhancement' }
    ]
  },
  {
    id: 'womens-sexual-health',
    name: "Women's Sexual Health",
    description: 'Specialized sexual wellness for women',
    icon: 'Blend',
    services: [
      { id: 'female-hormone-optimization', name: 'Female Hormonal Optimization', description: 'Women hormone balance' },
      { id: 'libido-nutrition', name: 'Libido-Boosting Nutrition', description: 'Nutrition for female desire' },
      { id: 'pelvic-health-program', name: 'Pelvic Health Program', description: 'Pelvic floor wellness' },
      { id: 'menopausal-intimacy', name: 'Menopausal Intimacy Advisor', description: 'Menopause sexual wellness' }
    ]
  }
];

/** Live count from data — grows automatically when services are added. */
export function categoryServiceCount(categoryId: string): number {
  if (categoryId === HUMAN_DATA_MODEL_GROUP_ID) {
    return humanDataModelServices.length;
  }
  return serviceCategories.find((c) => c.id === categoryId)?.services.length ?? 0;
}

export function getServiceCategory(categoryId: string): ServiceCategory | undefined {
  if (categoryId === HUMAN_DATA_MODEL_GROUP_ID) return humanDataModelCategory;
  return serviceCategories.find((c) => c.id === categoryId);
}

/** Path form used by App / ServiceDetail: `categoryId/serviceId` or `human-data-model/serviceId`. */
export function serviceDetailPath(categoryId: string, serviceId: string): string {
  return `${categoryId}/${serviceId}`;
}

/**
 * Resolve a service from `categoryId/serviceId`, `human-data-model/serviceId`, or a bare `serviceId`.
 * Category catalog remains the 20 medical categories; HDM shared services resolve via the HDM group.
 */
export function resolveServiceRef(
  ref: string,
): { category: ServiceCategory; service: Service } | null {
  if (!ref) return null;
  const [maybeCategoryId, maybeServiceId] = ref.split('/');

  if (maybeServiceId) {
    const category = getServiceCategory(maybeCategoryId);
    const service = category?.services.find((s) => s.id === maybeServiceId);
    if (category && service) return { category, service };
    return null;
  }

  const hdm = humanDataModelServices.find((s) => s.id === maybeCategoryId);
  if (hdm) return { category: humanDataModelCategory, service: hdm };

  for (const category of serviceCategories) {
    const service = category.services.find((s) => s.id === maybeCategoryId);
    if (service) return { category, service };
  }
  return null;
}

/** All services across the 20 categories plus shared Human Data Model services. */
export function totalServiceCount(): number {
  return (
    serviceCategories.reduce((sum, c) => sum + c.services.length, 0) +
    humanDataModelServices.length
  );
}

export function isHumanDataModelService(serviceId: string): boolean {
  return humanDataModelServices.some((s) => s.id === serviceId);
}
