interface EnvConfig {
  required: string[];
  optional: string[];
}

const PRODUCTION_ENV: EnvConfig = {
  required: [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ],
  optional: [
    'VITE_GA_MEASUREMENT_ID',
    'VITE_FACEBOOK_PIXEL_ID'
  ]
};

const DEVELOPMENT_ENV: EnvConfig = {
  required: [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ],
  optional: []
};

export class EnvValidationError extends Error {
  constructor(message: string, public missingVars: string[]) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

export function validateEnv(): void {
  if (import.meta.env.VITE_MOCK_MODE === '1') {
    return;
  }
  const isProduction = import.meta.env.PROD;
  const config = isProduction ? PRODUCTION_ENV : DEVELOPMENT_ENV;

  const missing = config.required.filter(
    key => !import.meta.env[key] || import.meta.env[key] === ''
  );

  if (missing.length > 0) {
    throw new EnvValidationError(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Set them for live Supabase, or enable VITE_MOCK_MODE=1 for local/dev only.',
      missing,
    );
  }

  if (isProduction) {
    const warnings: string[] = [];

    config.optional.forEach(key => {
      if (!import.meta.env[key]) {
        warnings.push(key);
      }
    });

    if (warnings.length > 0) {
      console.warn(
        '⚠️ Optional environment variables not set:',
        warnings.join(', '),
        '\nSome features may not work correctly.'
      );
    }
  }
}

export function getEnv(key: string, defaultValue?: string): string {
  const value = import.meta.env[key];

  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  return value || defaultValue || '';
}

export function isProduction(): boolean {
  return import.meta.env.PROD;
}

export function isDevelopment(): boolean {
  return import.meta.env.DEV;
}

export function getSupabaseUrl(): string {
  if (import.meta.env.VITE_MOCK_MODE === '1') {
    return getEnv('VITE_SUPABASE_URL', 'https://mock.supabase.co');
  }
  return getEnv('VITE_SUPABASE_URL');
}

export function getSupabaseAnonKey(): string {
  if (import.meta.env.VITE_MOCK_MODE === '1') {
    return getEnv('VITE_SUPABASE_ANON_KEY', 'mock-anon-key');
  }
  return getEnv('VITE_SUPABASE_ANON_KEY');
}

export function getGAMeasurementId(): string | undefined {
  return import.meta.env.VITE_GA_MEASUREMENT_ID;
}

export function getFacebookPixelId(): string | undefined {
  return import.meta.env.VITE_FACEBOOK_PIXEL_ID;
}
