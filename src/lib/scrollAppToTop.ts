/**
 * Reset SPA scroll position after client-side navigation.
 *
 * pushState does not reset scroll. Footer/header <a> clicks also leave the
 * link focused, and browsers often re-scroll that focused control into view
 * after React paints — so a single window.scrollTo in useEffect can lose.
 */

function isScrollable(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const style = window.getComputedStyle(el);
  const overflowY = style.overflowY;
  const canScrollY =
    (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
    el.scrollHeight > el.clientHeight + 1;
  return canScrollY;
}

function collectScrollRoots(): HTMLElement[] {
  const roots = new Set<HTMLElement>();

  document.querySelectorAll<HTMLElement>('[data-scroll-root]').forEach((el) => {
    roots.add(el);
  });

  document.querySelectorAll<HTMLElement>('main').forEach((el) => {
    if (isScrollable(el)) roots.add(el);
  });

  // Walk from page content upward for overflow ancestors (member layouts, etc.)
  const seed =
    document.querySelector<HTMLElement>('[data-scroll-root]') ||
    document.querySelector<HTMLElement>('main') ||
    document.getElementById('root');

  let node: HTMLElement | null = seed;
  while (node && node !== document.documentElement) {
    if (isScrollable(node)) roots.add(node);
    node = node.parentElement;
  }

  return Array.from(roots);
}

/** Instantly scroll window + known/discovered app scroll containers to top. */
export function scrollAppToTop(): void {
  try {
    window.scrollTo(0, 0);
  } catch {
    /* ignore */
  }

  const scrolling = document.scrollingElement;
  if (scrolling) scrolling.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  for (const el of collectScrollRoots()) {
    el.scrollTop = 0;
    el.scrollLeft = 0;
  }
}

/**
 * Scroll now, then again after paint (and a microtask/timeout) so focus
 * restoration / lazy Suspense layout cannot leave the viewport mid-page.
 */
export function scrollAppToTopAfterNavigate(): void {
  scrollAppToTop();

  // Blur page-chrome links so the browser does not keep the footer in view.
  const active = document.activeElement;
  if (
    active instanceof HTMLElement &&
    active.matches('a, button') &&
    active.closest('header, footer, [data-scroll-blur]')
  ) {
    active.blur();
  }

  requestAnimationFrame(() => {
    scrollAppToTop();
    requestAnimationFrame(() => {
      scrollAppToTop();
      window.setTimeout(scrollAppToTop, 0);
    });
  });
}
