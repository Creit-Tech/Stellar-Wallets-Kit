import type { SwkAppRoute } from '../types/mod.ts';
import { route, routerHistory } from '../state/mod.ts';
import { html } from 'htm/preact';
import { useEffect, useState } from "preact/hooks";
import type { VNode } from "preact";

export function resetHistory(): void {
  routerHistory.value = [];
}

export function navigateTo(nextRoute: SwkAppRoute): void {
  route.value = nextRoute;
  routerHistory.value = [...routerHistory.value, nextRoute];
}

export function goBack(): void {
  const currentHistory: SwkAppRoute[] = routerHistory.value;
  currentHistory.pop();
  routerHistory.value = currentHistory.slice();
  route.value = currentHistory[currentHistory.length - 1];
}

type PageTransitionProps = {
  children: VNode;
  isActive: boolean;
  duration?: number;
};
function PageTransition({ children, isActive, duration = 300 }: PageTransitionProps) {
  const [visible, setVisible] = useState(isActive);
  const [shouldRender, setShouldRender] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setShouldRender(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const timer: number = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [isActive, duration]);

  if (!shouldRender) return null;
  const styles = {
    position: visible ? 'relative' : 'absolute',
    inset: 0,
    transition: `opacity ${duration}ms ease, transform ${duration}ms ease, position ${duration}ms ease`,
    opacity: visible ? 1 : 0,
  };

  return html`<div style=${styles}>${children}</div>`;
}

export type MultiPageAnimatorProps = {
  currentRoute: SwkAppRoute;
  pages: Record<SwkAppRoute, () => VNode>;
  duration?: number;
};
export function MultiPageAnimator({ currentRoute, pages, duration = 300 }: MultiPageAnimatorProps) {
  const entries: VNode[] = Object.entries(pages).map(([key, Component]) =>
    html`
      <${PageTransition} id=${key} key=${key} isActive=${currentRoute === key} duration=${duration}>
        <${Component} />
      <//>
    `
  );

  return html`<div style=${{ overflow: 'scroll', position: 'relative', width: '100%', height: '100%' }}>${entries}</div>`;
}
