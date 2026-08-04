export type DeviceCatalogCategoryId =
  | 'smartwatch'
  | 'smart_ring'
  | 'recovery'
  | 'cgm'
  | 'blood_pressure'
  | 'body_composition'
  | 'sleep_home';

export type DeviceCapabilityId =
  | 'heart_rate'
  | 'hrv'
  | 'sleep'
  | 'spo2'
  | 'activity'
  | 'recovery'
  | 'ecg'
  | 'temperature'
  | 'glucose'
  | 'blood_pressure'
  | 'weight'
  | 'body_comp'
  | 'stress'
  | 'clinical_grade';

export type DeviceCatalogItemId =
  | 'apple_watch'
  | 'samsung_galaxy_watch'
  | 'garmin'
  | 'google_pixel_watch'
  | 'oura'
  | 'ultrahuman'
  | 'whoop'
  | 'dexcom_g7'
  | 'freestyle_libre'
  | 'omron'
  | 'withings_bpm'
  | 'withings_body'
  | 'eight_sleep'
  | 'fitbit'
  | 'polar';

export type DeviceCatalogItem = {
  id: DeviceCatalogItemId;
  capabilities: DeviceCapabilityId[];
  realtime?: boolean;
};

export type DeviceCatalogCategory = {
  id: DeviceCatalogCategoryId;
  items: DeviceCatalogItem[];
};

/** Static modern-device reference shown on My Devices (independent of live brand API). */
export const deviceCatalog: DeviceCatalogCategory[] = [
  {
    id: 'smartwatch',
    items: [
      {
        id: 'apple_watch',
        capabilities: ['heart_rate', 'hrv', 'sleep', 'spo2', 'activity', 'ecg', 'stress'],
        realtime: true,
      },
      {
        id: 'samsung_galaxy_watch',
        capabilities: ['heart_rate', 'hrv', 'sleep', 'spo2', 'activity', 'ecg', 'blood_pressure'],
        realtime: true,
      },
      {
        id: 'garmin',
        capabilities: ['heart_rate', 'hrv', 'sleep', 'activity', 'recovery', 'stress'],
      },
      {
        id: 'google_pixel_watch',
        capabilities: ['heart_rate', 'sleep', 'activity', 'spo2'],
        realtime: true,
      },
      {
        id: 'fitbit',
        capabilities: ['heart_rate', 'hrv', 'sleep', 'activity', 'stress', 'spo2'],
      },
      {
        id: 'polar',
        capabilities: ['heart_rate', 'hrv', 'sleep', 'activity', 'recovery'],
      },
    ],
  },
  {
    id: 'smart_ring',
    items: [
      {
        id: 'oura',
        capabilities: ['heart_rate', 'hrv', 'sleep', 'temperature', 'recovery', 'activity'],
      },
      {
        id: 'ultrahuman',
        capabilities: ['heart_rate', 'hrv', 'sleep', 'temperature', 'recovery'],
      },
    ],
  },
  {
    id: 'recovery',
    items: [
      {
        id: 'whoop',
        capabilities: ['heart_rate', 'hrv', 'sleep', 'recovery', 'activity', 'stress'],
        realtime: true,
      },
    ],
  },
  {
    id: 'cgm',
    items: [
      {
        id: 'dexcom_g7',
        capabilities: ['glucose', 'clinical_grade'],
        realtime: true,
      },
      {
        id: 'freestyle_libre',
        capabilities: ['glucose', 'clinical_grade'],
      },
    ],
  },
  {
    id: 'blood_pressure',
    items: [
      {
        id: 'omron',
        capabilities: ['blood_pressure', 'clinical_grade'],
      },
      {
        id: 'withings_bpm',
        capabilities: ['blood_pressure', 'clinical_grade'],
      },
    ],
  },
  {
    id: 'body_composition',
    items: [
      {
        id: 'withings_body',
        capabilities: ['weight', 'body_comp'],
      },
    ],
  },
  {
    id: 'sleep_home',
    items: [
      {
        id: 'eight_sleep',
        capabilities: ['sleep', 'heart_rate', 'hrv', 'temperature'],
      },
    ],
  },
];

export const deviceSignalKeys = [
  'continuous_glucose',
  'sleep_stages',
  'hrv_recovery',
  'blood_pressure',
  'body_composition',
  'activity_load',
] as const;

export type DeviceSignalKey = (typeof deviceSignalKeys)[number];

/** Flat list of every catalog device — used by Member Zone connect modal and public page counts. */
export const connectableDeviceIds: DeviceCatalogItemId[] = deviceCatalog.flatMap((category) =>
  category.items.map((item) => item.id),
);

export function catalogCategoryForItem(itemId: DeviceCatalogItemId): DeviceCatalogCategoryId | null {
  for (const category of deviceCatalog) {
    if (category.items.some((item) => item.id === itemId)) return category.id;
  }
  return null;
}
