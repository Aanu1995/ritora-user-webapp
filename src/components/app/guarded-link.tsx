'use client';

import Link, { type LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from 'react';
import { useUnsavedChangesStore } from '@/stores/unsaved-changes-store';

/**
 * A drop-in replacement for `next/link` that consults the global
 * {@link useUnsavedChangesStore}. If the store's `hasUnsavedChanges` flag is
 * true when the user clicks, navigation is intercepted and the confirmation
 * dialog opens; the actual push is deferred until the user picks "Discard
 * changes." Modifier-key clicks (cmd / ctrl / shift / middle click) bypass
 * the guard so native open-in-new-tab behaviour is preserved.
 */

type GuardedLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

export const GuardedLink = forwardRef<HTMLAnchorElement, GuardedLinkProps>(
  function GuardedLink({ onClick, href, ...props }, ref) {
    const router = useRouter();

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (isModifiedEvent(event)) return;

      const { hasUnsavedChanges, requestLeave } =
        useUnsavedChangesStore.getState();
      if (!hasUnsavedChanges) return;

      event.preventDefault();
      // href can be a string or UrlObject; the router push accepts both.
      requestLeave(() => {
        router.push(typeof href === 'string' ? href : href.toString());
      });
    };

    return <Link ref={ref} href={href} onClick={handleClick} {...props} />;
  },
);
