import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import BackButton from '../BackButton';

export type LegalTone = 'orange' | 'red' | 'blue' | 'green' | 'purple' | 'gray';

type LegalBlock =
  | { t: 'p'; text: string; strong?: boolean }
  | { t: 'h3'; text: string }
  | { t: 'ul'; items: string[] }
  | { t: 'note'; tone: LegalTone; title?: string; blocks: LegalBlock[] };

interface LegalSection {
  h2?: string;
  blocks: LegalBlock[];
}

interface LegalDocumentProps {
  onNavigate: (page: string) => void;
  /** Key under `legal.*` in the translation bundle, e.g. `privacyPolicy`. */
  docKey: string;
  icon: ReactNode;
  iconTone: LegalTone;
  ctaTarget?: string;
}

const NOTE_TONE: Record<LegalTone, string> = {
  orange: 'bg-orange-50 border-orange-200',
  red: 'bg-red-50 border-red-200',
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-green-50 border-green-200',
  purple: 'bg-purple-50 border-purple-200',
  gray: 'bg-gray-50 border-gray-300',
};

const ICON_TONE: Record<LegalTone, string> = {
  orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600',
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  gray: 'bg-gray-100 text-gray-600',
};

const LINK_TONE: Record<LegalTone, string> = {
  orange: 'text-orange-600 hover:text-orange-700',
  red: 'text-red-600 hover:text-red-700',
  blue: 'text-blue-600 hover:text-blue-700',
  green: 'text-green-600 hover:text-green-700',
  purple: 'text-purple-600 hover:text-purple-700',
  gray: 'text-gray-600 hover:text-gray-700',
};

const TONES = Object.keys(NOTE_TONE) as LegalTone[];

/**
 * Legal documents are authored as a flat list of prefixed lines so that every
 * translation only has to carry text, never document structure:
 *
 *   h2|Section heading      h3|Sub-heading        p|Paragraph
 *   ps|Emphasised paragraph li|List item          note:blue|Callout title
 *   /note                   (closes the callout)
 */
function parseBody(lines: string[]): LegalSection[] {
  const sections: LegalSection[] = [];
  let current: LegalSection = { blocks: [] };
  let stack: LegalBlock[][] = [current.blocks];

  const target = () => stack[stack.length - 1]!;

  const pushSection = () => {
    if (current.h2 || current.blocks.length > 0) sections.push(current);
  };

  for (const raw of lines) {
    if (typeof raw !== 'string') continue;
    const separator = raw.indexOf('|');
    const tag = separator === -1 ? raw.trim() : raw.slice(0, separator);
    const text = separator === -1 ? '' : raw.slice(separator + 1);

    if (tag === '/note') {
      if (stack.length > 1) stack.pop();
      continue;
    }

    if (tag === 'h2') {
      pushSection();
      current = { h2: text, blocks: [] };
      stack = [current.blocks];
      continue;
    }

    if (tag === 'h3') {
      target().push({ t: 'h3', text });
      continue;
    }

    if (tag === 'li') {
      const blocks = target();
      const last = blocks[blocks.length - 1];
      if (last && last.t === 'ul') last.items.push(text);
      else blocks.push({ t: 'ul', items: [text] });
      continue;
    }

    if (tag === 'p' || tag === 'ps') {
      target().push({ t: 'p', text, strong: tag === 'ps' });
      continue;
    }

    if (tag === 'note' || tag.startsWith('note:')) {
      const requested = tag.slice(5) as LegalTone;
      const note: LegalBlock = {
        t: 'note',
        tone: TONES.includes(requested) ? requested : 'gray',
        title: text || undefined,
        blocks: [],
      };
      target().push(note);
      stack.push(note.blocks);
      continue;
    }
  }

  pushSection();
  return sections;
}

/** Renders `**bold**` segments and `\n` line breaks from translated strings. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, lineIndex) => (
        <span key={lineIndex}>
          {lineIndex > 0 && <br />}
          {line.split('**').map((segment, index) =>
            index % 2 === 1 ? <strong key={index}>{segment}</strong> : <span key={index}>{segment}</span>
          )}
        </span>
      ))}
    </>
  );
}

function Blocks({ blocks, inNote = false }: { blocks: LegalBlock[]; inNote?: boolean }) {
  return (
    <>
      {blocks.map((block, index) => {
        const last = index === blocks.length - 1;
        if (block.t === 'h3') {
          return (
            <h3 key={index} className="text-xl font-semibold text-gray-900 mb-3">
              <RichText text={block.text} />
            </h3>
          );
        }
        if (block.t === 'ul') {
          return (
            <ul key={index} className={`text-gray-800 space-y-2 ${last ? '' : 'mb-4'}`}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <RichText text={item} />
                </li>
              ))}
            </ul>
          );
        }
        if (block.t === 'note') {
          return (
            <div key={index} className={`rounded-xl border p-6 ${NOTE_TONE[block.tone]} ${last ? '' : 'mb-4'}`}>
              {block.title && (
                <p className="text-gray-900 font-semibold mb-3">
                  <RichText text={block.title} />
                </p>
              )}
              <Blocks blocks={block.blocks} inNote />
            </div>
          );
        }
        return (
          <p
            key={index}
            className={`${block.strong ? 'text-gray-900 font-medium' : 'text-gray-800'} ${
              last && inNote ? 'mb-0' : 'mb-3'
            }`}
          >
            <RichText text={block.text} />
          </p>
        );
      })}
    </>
  );
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

export default function LegalDocument({
  onNavigate,
  docKey,
  icon,
  iconTone,
  ctaTarget = 'contact',
}: LegalDocumentProps) {
  const { t } = useTranslation();

  const intro = asStringArray(t(`legal.${docKey}.intro`, { returnObjects: true }));
  const sections = parseBody(asStringArray(t(`legal.${docKey}.body`, { returnObjects: true })));
  const outroTitle = t(`legal.${docKey}.outro.title`, { defaultValue: '' });
  const outroText = t(`legal.${docKey}.outro.text`, { defaultValue: '' });
  const outroCta = t(`legal.${docKey}.outro.cta`, { defaultValue: '' });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bm-page)] via-orange-50/30 to-[var(--bm-page)] dark:from-[var(--bm-page)] dark:via-[var(--bm-surface)] dark:to-[var(--bm-page)] pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton onNavigate={onNavigate} label={t('common.back')} />

        <div className="text-center mb-12">
          <span className="inline-flex items-center rounded-full border border-orange-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-orange-700">
            {t('legal.badge')}
          </span>
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${ICON_TONE[iconTone]}`}>
            {icon}
          </div>
          <h1 className="text-4xl font-semibold text-gray-900 dark:text-white mb-4">{t(`legal.${docKey}.title`)}</h1>
          <p className="text-gray-700 dark:text-gray-300">
            {t('legal.lastUpdated', { date: t('legal.updatedOn') })}
          </p>
        </div>

        <div className="prose prose-lg max-w-none rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl">
          {intro.length > 0 && (
            <div className={`rounded-xl border p-6 mb-8 ${NOTE_TONE[iconTone]}`}>
              <Blocks blocks={intro.map((text) => ({ t: 'p' as const, text, strong: true }))} inNote />
            </div>
          )}

          {sections.map((section, index) => (
            <section key={index} className="mb-8">
              {section.h2 && (
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  <RichText text={section.h2} />
                </h2>
              )}
              <Blocks blocks={section.blocks} />
            </section>
          ))}

          {(outroTitle || outroText) && (
            <div className={`rounded-xl border p-6 mt-8 ${NOTE_TONE[iconTone]}`}>
              {outroTitle && (
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  <RichText text={outroTitle} />
                </h3>
              )}
              {outroText && (
                <p className="text-gray-800 mb-3">
                  <RichText text={outroText} />
                </p>
              )}
              {outroCta && (
                <button onClick={() => onNavigate(ctaTarget)} className={`font-medium ${LINK_TONE[iconTone]}`}>
                  {outroCta} →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
