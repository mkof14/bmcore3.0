import {
  ShieldPlus,
  FlaskConical,
  Circle,
  Stethoscope,
  UserRound,
  Pill,
  DollarSign,
  ClipboardPlus,
  Beaker,
  Syringe,
  Microscope,
  Pill as PillIcon,
  Map,
  Shield,
  Bug,
  Dna,
  Siren,
  Monitor,
  HeartPulse,
  Activity,
  Apple,
  Moon,
  Leaf,
  Users,
  Zap,
  Eye,
  Tablet,
  Flower2,
  Sun,
  Droplets,
  Brain,
  Dumbbell,
  type LucideIcon,
} from 'lucide-react';

/** Domain icons — prefer domain-specific glyphs over generic AI chrome. */
const BY_ID: Record<string, LucideIcon> = {
  'risk-insight': ShieldPlus,
  'lab-results': FlaskConical,
  'drug-interaction': Circle,
  'symptom-analyzer': Stethoscope,
  'chronic-disease': UserRound,
  'medication-adherence': Pill,
  'care-cost': DollarSign,
  'post-surgery': ClipboardPlus,
  'clinical-trial': Beaker,
  'pre-surgery': Syringe,
  'rare-disease': Microscope,
  'med-refill': PillIcon,
  'pain-map': Map,
  vaccination: Shield,
  'post-covid': Bug,
  'genetic-risk': Dna,
  'emergency-profile': Siren,
  'remote-vitals': Monitor,
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'critical-health': HeartPulse,
  'everyday-wellness': Sun,
  longevity: Activity,
  'mental-wellness': Brain,
  'fitness-performance': Dumbbell,
  'womens-health': Flower2,
  'mens-health': UserRound,
  'beauty-skincare': Droplets,
  'nutrition-diet': Apple,
  'sleep-recovery': Moon,
  'environmental-health': Leaf,
  'family-health': Users,
  'preventive-medicine': Shield,
  biohacking: Zap,
  'senior-care': HeartPulse,
  'eye-health': Eye,
  'digital-therapeutics': Tablet,
  'general-sexual': HeartPulse,
  'mens-sexual-health': HeartPulse,
  'womens-sexual-health': Flower2,
};

export function serviceIcon(serviceId: string): LucideIcon {
  return BY_ID[serviceId] ?? Activity;
}

export function categoryIcon(categoryId: string): LucideIcon {
  return CATEGORY_ICONS[categoryId] ?? HeartPulse;
}
