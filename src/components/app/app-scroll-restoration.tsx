"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  clearExplicitAppScrollPosition,
  consumeAppScrollRestoreRequest,
  getAppScrollPosition,
  getAppScrollRoot,
  saveAppScrollPosition,
} from "@/lib/app-scroll-restoration";

export function AppScrollRestoration() {
  const pathname = usePathname() ?? "";
  const currentPathnameRef = useRef(pathname);
  const isRestoringRef = useRef(false);
  const shouldRestoreOnNavigationRef = useRef(false);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const handlePopState = () => {
      shouldRestoreOnNavigationRef.current = true;
    };

    const handleBeforeUnload = () => {
      const scrollRoot = getAppScrollRoot();
      if (scrollRoot) {
        saveAppScrollPosition(currentPathnameRef.current, scrollRoot.scrollTop);
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const scrollRoot = getAppScrollRoot();
    if (!scrollRoot) {
      return;
    }

    let animationFrameId = 0;
    const handleScroll = () => {
      if (isRestoringRef.current) {
        return;
      }

      if (animationFrameId !== 0) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = 0;
        saveAppScrollPosition(
          currentPathnameRef.current,
          scrollRoot.scrollTop,
        );
      });
    };

    scrollRoot.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (animationFrameId !== 0) {
        window.cancelAnimationFrame(animationFrameId);
      }

      scrollRoot.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const scrollRoot = getAppScrollRoot();

    if (!scrollRoot || currentPathnameRef.current === pathname) {
      return;
    }

    const shouldRestore =
      shouldRestoreOnNavigationRef.current ||
      consumeAppScrollRestoreRequest(pathname);

    shouldRestoreOnNavigationRef.current = false;
    currentPathnameRef.current = pathname;

    const targetScrollTop = shouldRestore ? getAppScrollPosition(pathname) : 0;
    if (shouldRestore) {
      clearExplicitAppScrollPosition(pathname);
    }

    let retryCount = 0;
    let timeoutId = 0;
    let finishTimeoutId = 0;
    let animationFrameId = 0;
    let isCanceled = false;

    const finishRestore = () => {
      window.clearTimeout(finishTimeoutId);
      finishTimeoutId = window.setTimeout(() => {
        if (!isCanceled) {
          isRestoringRef.current = false;
        }
      }, 100);
    };

    const restore = () => {
      if (isCanceled) {
        return;
      }

      const nextScrollRoot = getAppScrollRoot();
      if (!nextScrollRoot) {
        finishRestore();
        return;
      }

      nextScrollRoot.scrollTo({
        top: targetScrollTop,
        left: 0,
        behavior: "auto",
      });

      const hasReachedTarget =
        Math.abs(nextScrollRoot.scrollTop - targetScrollTop) <= 2;
      const canReachTarget =
        nextScrollRoot.scrollHeight - nextScrollRoot.clientHeight >=
        targetScrollTop - 2;

      if (targetScrollTop === 0 || hasReachedTarget || retryCount >= 80) {
        finishRestore();
        return;
      }

      retryCount += 1;
      timeoutId = window.setTimeout(() => {
        animationFrameId = window.requestAnimationFrame(restore);
      }, canReachTarget ? 16 : 50);
    };

    isRestoringRef.current = true;
    animationFrameId = window.requestAnimationFrame(restore);

    return () => {
      isCanceled = true;
      isRestoringRef.current = false;
      window.cancelAnimationFrame(animationFrameId);
      window.clearTimeout(finishTimeoutId);

      if (timeoutId !== 0) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [pathname]);

  return null;
}
