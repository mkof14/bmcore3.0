export type KeyScope = "client_public" | "server_private" | "flag";
export type EnvTarget = "preview" | "production" | "both";
export type KeyCategory = "core" | "ai" | "email" | "analytics" | "devices" | "storage" | "admin";

export type KeySpec = {
  key: string;
  label: string;
  scope: KeyScope;
  envTarget: EnvTarget;
  category: KeyCategory;
  company: string;
  example?: string;
  description?: string;
  required?: boolean;
  validator?: { startsWith?: string; regex?: string; notContains?: string[] };
};

export const KEY_SPECS: KeySpec[] = [
  { key: "VITE_SUPABASE_URL", label: "Supabase URL", scope: "client_public", envTarget: "both", category: "core", company: "Supabase", example: "https://xxx.supabase.co", description: "Database and authentication URL", required: true, validator: { startsWith: "https://" } },
  { key: "VITE_SUPABASE_ANON_KEY", label: "Supabase Anon Key", scope: "client_public", envTarget: "both", category: "core", company: "Supabase", description: "Public anon key for client access", required: true },
  { key: "SUPABASE_SERVICE_ROLE_KEY", label: "Supabase Service Role", scope: "server_private", envTarget: "production", category: "core", company: "Supabase", description: "Admin key for server-side operations" },

  { key: "VERCEL_TOKEN", label: "Vercel API Token", scope: "server_private", envTarget: "production", category: "admin", company: "Vercel", description: "API token for deployment management" },
  { key: "VERCEL_PROJECT_ID", label: "Vercel Project ID", scope: "server_private", envTarget: "production", category: "admin", company: "Vercel", description: "Project identifier" },
  { key: "VERCEL_TEAM_ID", label: "Vercel Team ID", scope: "server_private", envTarget: "production", category: "admin", company: "Vercel", description: "Team identifier (optional)" },

  { key: "GEMINI_API_KEY", label: "Google AI (Gemini) Key", scope: "server_private", envTarget: "production", category: "ai", company: "Google AI", description: "Gemini 1.5/2.0 for Health Guide", example: "AIza..." },
  { key: "ANTHROPIC_API_KEY", label: "Anthropic (Claude) Key", scope: "server_private", envTarget: "production", category: "ai", company: "Anthropic", description: "Claude for report analysis", example: "sk-ant-..." },
  { key: "OPENAI_API_KEY", label: "OpenAI (GPT) Key", scope: "server_private", envTarget: "production", category: "ai", company: "OpenAI", description: "GPT-4/5 for Q&A", example: "sk-..." },

  { key: "RESEND_API_KEY", label: "Resend API Key", scope: "server_private", envTarget: "production", category: "email", company: "Resend", description: "Email delivery service", example: "re_..." },
  { key: "SENDGRID_API_KEY", label: "SendGrid API Key", scope: "server_private", envTarget: "production", category: "email", company: "SendGrid", description: "Alternative email service", example: "SG..." },
  { key: "SES_ACCESS_KEY_ID", label: "AWS SES Access Key", scope: "server_private", envTarget: "production", category: "email", company: "AWS SES", description: "AWS email service ID" },
  { key: "SES_SECRET_ACCESS_KEY", label: "AWS SES Secret Key", scope: "server_private", envTarget: "production", category: "email", company: "AWS SES", description: "AWS email service secret" },
  { key: "SES_REGION", label: "AWS SES Region", scope: "server_private", envTarget: "production", category: "email", company: "AWS SES", description: "AWS region", example: "us-east-1" },

  { key: "STRIPE_SECRET_KEY", label: "Stripe Secret Key", scope: "server_private", envTarget: "production", category: "core", company: "Stripe", description: "Stripe secret key for checkout sessions", example: "sk_live_..." },

  { key: "VITE_GA_MEASUREMENT_ID", label: "Google Analytics ID", scope: "client_public", envTarget: "both", category: "analytics", company: "Google Analytics", description: "GA4 measurement ID", example: "G-XXXXXXXXXX" },
  { key: "VITE_SENTRY_DSN", label: "Sentry DSN", scope: "client_public", envTarget: "both", category: "analytics", company: "Sentry", description: "Error tracking and monitoring" },
  { key: "VITE_FACEBOOK_PIXEL_ID", label: "Meta Pixel ID", scope: "client_public", envTarget: "both", category: "analytics", company: "Meta", description: "Facebook conversion tracking" },

  { key: "WITHINGS_CLIENT_ID", label: "Withings Client ID", scope: "client_public", envTarget: "both", category: "devices", company: "Withings", description: "Fitness device integration" },
  { key: "WITHINGS_CLIENT_SECRET", label: "Withings Client Secret", scope: "server_private", envTarget: "production", category: "devices", company: "Withings", description: "Withings OAuth secret" },
  { key: "APPLE_HEALTH_API_KEY", label: "Apple HealthKit Key", scope: "client_public", envTarget: "both", category: "devices", company: "Apple", description: "HealthKit integration (future)" },
  { key: "GOOGLE_FIT_API_KEY", label: "Google Fit Key", scope: "client_public", envTarget: "both", category: "devices", company: "Google Fit", description: "Google Fit integration (future)" },
  { key: "FITBIT_CLIENT_ID", label: "Fitbit Client ID", scope: "client_public", envTarget: "both", category: "devices", company: "Fitbit", description: "Fitbit integration (future)" },

  { key: "AWS_ACCESS_KEY_ID", label: "AWS Access Key ID", scope: "server_private", envTarget: "production", category: "storage", company: "AWS S3", description: "AWS credentials for S3" },
  { key: "AWS_SECRET_ACCESS_KEY", label: "AWS Secret Access Key", scope: "server_private", envTarget: "production", category: "storage", company: "AWS S3", description: "AWS secret for S3" },
  { key: "AWS_S3_BUCKET", label: "AWS S3 Bucket", scope: "server_private", envTarget: "production", category: "storage", company: "AWS S3", description: "S3 bucket name" },
  { key: "CLOUDINARY_URL", label: "Cloudinary URL", scope: "server_private", envTarget: "production", category: "storage", company: "Cloudinary", description: "Media storage URL" },
  { key: "CLOUDINARY_API_KEY", label: "Cloudinary API Key", scope: "server_private", envTarget: "production", category: "storage", company: "Cloudinary", description: "Cloudinary credentials" },

  { key: "GITHUB_TOKEN", label: "GitHub Token", scope: "server_private", envTarget: "production", category: "admin", company: "GitHub", description: "CI/CD and deployments" },
  { key: "VITE_CONFIG_LOCK", label: "Config Lock", scope: "flag", envTarget: "both", category: "admin", company: "BioMath Core", description: "Lock configuration UI", example: "0|1" },
  { key: "VITE_KEYS_PAGE_ENABLED", label: "Keys Page Enabled", scope: "flag", envTarget: "both", category: "admin", company: "BioMath Core", description: "Enable API keys management", example: "0|1" }
];

export const CATEGORIES = [
  { id: "core" as KeyCategory, label: "Core Infrastructure", icon: "🏗️", description: "Database, hosting, and essential services" },
  { id: "ai" as KeyCategory, label: "Artificial Intelligence", icon: "🤖", description: "AI models and assistants" },
  { id: "email" as KeyCategory, label: "Email & Notifications", icon: "✉️", description: "Email delivery services" },
  { id: "analytics" as KeyCategory, label: "Analytics & Monitoring", icon: "📈", description: "Tracking and error monitoring" },
  { id: "devices" as KeyCategory, label: "Health Devices", icon: "⌚", description: "Fitness and health device integrations" },
  { id: "storage" as KeyCategory, label: "Storage & Media", icon: "☁️", description: "File storage and media management" },
  { id: "admin" as KeyCategory, label: "Admin & Security", icon: "🔒", description: "System administration and deployment" }
];

export function isAllowedServerKey(k: string): boolean {
  const whitelist = (process.env.ALLOWED_SERVER_KEYS || "")
    .split(/[,\s]+/)
    .map((s: string) => s.trim())
    .filter(Boolean);
  return whitelist.includes(k);
}
