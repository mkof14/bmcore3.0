/**
 * Public BioMath Core social profiles.
 *
 * Only set a URL when the profile is known in-repo (Organization sameAs / SEO).
 * Empty strings are omitted from the Footer — never use href="#".
 *
 * Known sources:
 * - https://twitter.com/biomathcore
 * - https://www.linkedin.com/company/biomathcore
 * - https://www.facebook.com/biomathcore
 * - https://github.com/biomathcore
 *
 * Instagram / YouTube channel URLs were not found in the codebase — leave empty
 * until confirmed, then add them here.
 */
export const socialLinks = {
  facebook: 'https://www.facebook.com/biomathcore',
  youtube: '',
  instagram: '',
  x: 'https://twitter.com/biomathcore',
  linkedin: 'https://www.linkedin.com/company/biomathcore',
  github: 'https://github.com/biomathcore',
} as const;

export type SocialNetwork = keyof typeof socialLinks;

/** Networks rendered as Footer icon buttons (order preserved). */
export const footerSocialNetworks: SocialNetwork[] = [
  'facebook',
  'youtube',
  'instagram',
  'x',
  'linkedin',
];

/** Non-empty profile URLs for schema.org sameAs and similar. */
export function getSocialSameAs(): string[] {
  return Object.values(socialLinks).filter((href) => href.length > 0);
}

export function getFooterSocialLinks(): { network: SocialNetwork; href: string }[] {
  const links: { network: SocialNetwork; href: string }[] = [];
  for (const network of footerSocialNetworks) {
    const href = socialLinks[network];
    if (href) links.push({ network, href });
  }
  return links;
}
