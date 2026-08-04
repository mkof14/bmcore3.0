/**
 * Canonical method articles shown when Supabase blog is empty (mock / fresh DB).
 * English base content — UI chrome remains i18n'd via content.blog.*.
 */
export interface SeedBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: string;
  published_at: string;
}

export const SEED_BLOG_POSTS: SeedBlogPost[] = [
  {
    id: 'seed-biomathematical-model',
    title: 'How the biomathematical model works',
    slug: 'how-the-biomathematical-model-works',
    excerpt:
      'BioMath Core does not stop at charts. It builds a living Human Data Model — a biomathematical model that connects signals over time.',
    content: `BioMath Core starts from a simple idea: health understanding improves when data is modeled as a system, not listed as isolated numbers.

From measurements to a Human Data Model

Labs, wearable signals, history, and lifestyle inputs are aligned into one Human Data Model. The model uses biomathematical structure — relationships between physiological processes — so new evidence updates a coherent picture instead of creating another disconnected report.

Why structure matters

Pure pattern matching can overfit noise. Biomathematical priors constrain learning: stress-recovery dynamics, metabolic state, inflammation load, and similar constructs remain inspectable. Health Guide then explains what changed and what is worth attention.

What this is not

This is not a medical diagnosis device. It is wellness intelligence: clearer context for prevention conversations with qualified clinicians.`,
    featured_image: '/blog/cover-method.webp',
    category: 'Method',
    published_at: '2026-07-15T10:00:00.000Z',
  },
  {
    id: 'seed-vs-biomarker-dashboards',
    title: 'Beyond biomarker dashboards',
    slug: 'beyond-biomarker-dashboards',
    excerpt:
      'Most health apps show biomarkers. BioMath Core asks what those markers mean together inside a living model of you.',
    content: `A typical biomarker service shows a panel: green, yellow, red. Useful as a snapshot — limited as lifelong understanding.

The dashboard problem

Dashboards excel at presentation. They rarely explain how sleep debt, glucose variability, inflammation markers, and training load interact across months. Users accumulate PDFs and still lack a continuous narrative.

The BioMath Core difference

The Human Data Model accumulates events into one evolving structure. Categories in the Services Catalog feed the same model. Health Guide reasons over that structure with dual perspectives — biomathematical and clinical — so guidance stays tied to your history, not a generic template.

When a dashboard is still fine

If you only need a one-time lab readout, a dashboard may be enough. If you want continuity — what changed, why it might matter, what to watch next — you need a model.`,
    featured_image: '/blog/cover-dashboard.webp',
    category: 'Method',
    published_at: '2026-07-22T10:00:00.000Z',
  },
  {
    id: 'seed-dual-intelligence',
    title: 'Dual intelligence: why BioMath Core uses two models',
    slug: 'dual-intelligence-two-models',
    excerpt:
      'One biomathematical lens. One clinical lens. Agreement builds confidence; disagreement flags what deserves a closer look.',
    content: `BioMath Core deliberately runs two independent analyses on the same Human Data Model inputs.

Mathematical model

Data-driven biomathematical analysis looks for structure: correlations, anomalies, trajectories. It is strong at pattern discovery and quantitative consistency.

Clinical model

Evidence-oriented analysis applies medical knowledge and guideline-style reasoning. It is strong at safety context and practical prioritization.

The second-opinion effect

When both agree, confidence rises. When they diverge, Health Guide surfaces the tension — similar to seeking a second opinion — so you and your clinician know where attention is warranted.

Learn more on the Why Two Models page.`,
    featured_image: '/blog/cover-dual.webp',
    category: 'Product',
    published_at: '2026-07-29T10:00:00.000Z',
  },
  {
    id: 'seed-privacy-trust',
    title: 'Privacy and trust in a living health model',
    slug: 'privacy-and-trust-human-data-model',
    excerpt:
      'A living Human Data Model is only useful if you control the data. Here is how BioMath Core approaches privacy and trust.',
    content: `Building a Human Data Model requires sensitive information. Trust is therefore a product requirement, not a footnote.

Your data, your decisions

You decide what to share. Features are designed so wellness guidance does not require surrendering control of your records.

Security posture

BioMath Core aims for HIPAA-aligned protections with encryption in transit and at rest, clear legal notices, and consent-gated analytics. Details live on Privacy & Trust and the legal pages.

Transparent guidance

Health Guide is an assistant, not a doctor. Dual-model outputs are meant to be inspectable enough to support — not replace — professional care.

If you have questions about enterprise or partnership data handling, contact the team.`,
    featured_image: '/blog/cover-privacy.webp',
    category: 'Trust',
    published_at: '2026-08-01T10:00:00.000Z',
  },
];
