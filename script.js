(() => {
  'use strict';

  /*
   * Native MPA identity and direction patterns:
   * Bramus, view-transitions-demos, Apache-2.0:
   * https://github.com/bramus/view-transitions-demos/tree/main/src/stack-navigator/mpa
   * The selected-element lifecycle is also illustrated in the Profiles example:
   * https://developer.chrome.com/docs/web-platform/view-transitions/cross-document
   *
   * This file is a classic, non-deferred external head script so pagereveal is
   * registered before the first rendering opportunity. DOM initialization is
   * separate. The template's expect target is ordinary server-rendered HTML,
   * not a JavaScript readiness gate.
   *
   * Navigation remains document navigation. There is no fetched-page router,
   * cloned transition overlay, or manual history scroll restoration.
   */

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const PASSAGE_KEY = 'nkbr:document-passage:v1';
  const PASSAGE_MAX_AGE = 120000;
  const sharedSelectors = [
    ['[data-shared-surface]', 'nkbr-paper'],
    ['[data-shared-icon]', 'nkbr-icon'],
    ['[data-shared-title]', 'nkbr-title'],
  ];

  const animations = new Set();
  const revealed = new WeakSet();

  let activeTransition = null;
  let observer = null;
  let initialized = false;
  let suspended = false;
  let revealFrame = 0;
  let requestedQuiet = false;
  let fallbackReturn = null;
  let litCard = null;
  let pointerSample = null;
  let lightFrame = 0;

  /*
   * Auto restoration also covers a collection entry whose selected card is
   * several screens down. Never scroll that document to the top, to #projects,
   * or to a guessed saved offset during a history traversal.
   */
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'auto';
  }

  function parseURL(value) {
    if (!value) return null;
    try {
      return new URL(value, window.location.href);
    } catch {
      return null;
    }
  }

  function routeFor(value) {
    const url = value instanceof URL ? value : parseURL(value);
    if (!url || url.origin !== window.location.origin) return null;

    if (url.pathname === '/') {
      return { kind: 'home', url };
    }

    const match = url.pathname.match(/^\/projects\/([^/]+)\/?$/);
    if (!match) return null;

    try {
      return { kind: 'project', id: decodeURIComponent(match[1]), url };
    } catch {
      return null;
    }
  }

  function documentMatches(route) {
    if (!route) return false;
    if (route.kind === 'home') return root.dataset.page === 'home';

    return root.dataset.page === 'project' &&
      root.dataset.project === route.id;
  }

  function makePassage(fromValue, toValue, navigationType = null) {
    const from = routeFor(fromValue);
    const to = routeFor(toValue);
    if (!from || !to) return null;

    if (from.kind === 'home' && to.kind === 'project') {
      return {
        from,
        to,
        projectId: to.id,
        direction: 'open',
        navigationType,
      };
    }

    if (from.kind === 'project' && to.kind === 'home') {
      return {
        from,
        to,
        projectId: from.id,
        direction: 'close',
        navigationType,
      };
    }

    return null;
  }

  function removePassage() {
    try {
      window.sessionStorage.removeItem(PASSAGE_KEY);
    } catch {
      // Navigation and native activation information do not require storage.
    }
  }

  function storePassage(passage) {
    removePassage();
    if (!passage) return;

    try {
      window.sessionStorage.setItem(PASSAGE_KEY, JSON.stringify({
        from: passage.from.url.href,
        to: passage.to.url.href,
        navigationType: passage.navigationType,
        time: Date.now(),
      }));
    } catch {
      // Storage can be disabled. Browsers with navigation.activation still work.
    }
  }

  function takePassage() {
    let value = null;

    try {
      const raw = window.sessionStorage.getItem(PASSAGE_KEY);
      window.sessionStorage.removeItem(PASSAGE_KEY);
      if (raw) value = JSON.parse(raw);
    } catch {
      return null;
    }

    if (!value || typeof value.time !== 'number') return null;

    const age = Date.now() - value.time;
    if (age < 0 || age > PASSAGE_MAX_AGE) return null;

    const destination = parseURL(value.to);
    if (!destination || destination.href !== window.location.href) return null;

    return makePassage(value.from, value.to, value.navigationType);
  }

  function activationForCurrentDocument() {
    try {
      return window.navigation?.activation || null;
    } catch {
      return null;
    }
  }

  function initialLoadWasTraversal() {
    try {
      return performance.getEntriesByType('navigation')[0]?.type === 'back_forward';
    } catch {
      return false;
    }
  }

  function incomingPassage() {
    const stored = takePassage();
    const activation = activationForCurrentDocument();
    if (activation?.navigationType === 'reload') return null;

    let passage = null;

    if (activation?.from?.url) {
      passage = makePassage(
        activation.from.url,
        activation.entry?.url || window.location.href,
        activation.navigationType
      );
    } else {
      /*
       * pageswap.activation is available in some browsers that do not expose
       * window.navigation. A one-use, same-tab ticket carries that actual
       * navigation identity, rather than inferring it from a stale click.
       */
      passage = stored;
    }

    if (!passage || passage.to.url.href !== window.location.href) return null;
    return documentMatches(passage.to) ? passage : null;
  }

  function visibleInViewport(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const width = window.innerWidth || root.clientWidth;
    const height = window.innerHeight || root.clientHeight;

    return rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < height &&
      rect.left < width;
  }

  function sharedScope(projectId) {
    const selector = root.dataset.page === 'home'
      ? '.project-card[data-project]'
      : '.release-panel[data-project]';

    return Array.from(document.querySelectorAll(selector))
      .find(element => element.dataset.project === projectId) || null;
  }

  function skipTransition(transition) {
    if (!transition) return;

    // ready normally rejects on the outgoing document; handle it explicitly.
    transition.ready.catch(() => {});
    transition.finished.catch(() => {});

    try {
      transition.skipTransition();
    } catch {
      // A completed or already-skipped transition needs no further action.
    }
  }

  function releaseNames(record) {
    if (activeTransition !== record) return;

    for (const [element, name] of record.elements) {
      if (element.style.viewTransitionName === name) {
        element.style.viewTransitionName = '';
      }
    }
  }

  function finishTransition(record) {
    /*
     * Promise callbacks from the old activation can resume from bfcache after
     * a new activation has started. They must not clean up the new selection.
     */
    if (activeTransition !== record) return false;

    releaseNames(record);
    record.scope.classList.remove('is-shared-selected');
    delete root.dataset.vtDirection;
    delete root.dataset.vtPhase;
    activeTransition = null;
    return true;
  }

  function resetTransition() {
    if (activeTransition) {
      const previous = activeTransition;
      skipTransition(previous.transition);
      finishTransition(previous);
    }

    // Defensive cleanup for a document restored before an old promise resumes.
    for (const [selector, name] of sharedSelectors) {
      document.querySelectorAll(selector).forEach(element => {
        if (element.style.viewTransitionName === name) {
          element.style.viewTransitionName = '';
        }
      });
    }

    document.querySelectorAll('.is-shared-selected').forEach(element => {
      element.classList.remove('is-shared-selected');
    });

    delete root.dataset.vtDirection;
    delete root.dataset.vtPhase;
  }

  function bindTransition(transition, passage, phase) {
    if (!transition || !passage || reducedMotion.matches) return false;

    const scope = sharedScope(passage.projectId);
    if (!scope || !visibleInViewport(scope)) return false;

    const elements = sharedSelectors.map(([selector, name]) => [
      scope.querySelector(selector),
      name,
    ]);

    if (elements.some(([element]) => !element)) return false;

    const record = {
      transition,
      scope,
      elements,
      phase,
      direction: passage.direction,
    };

    activeTransition = record;
    root.dataset.vtDirection = passage.direction;
    root.dataset.vtPhase = phase;
    scope.classList.add('is-shared-selected');

    /*
     * Three names, one selected project. CSSOM name assignment is deliberate:
     * no inline stylesheet, style attribute string, or dynamic CSS rule is used.
     */
    for (const [element, name] of elements) {
      element.style.viewTransitionName = name;
      if (element.hasAttribute('data-reveal')) revealed.add(element);
    }

    if (scope.hasAttribute('data-reveal')) revealed.add(scope);

    if (phase === 'in' && passage.direction === 'open') {
      document.querySelectorAll('[data-detail-stage]').forEach(element => {
        revealed.delete(element);
      });
    }

    try {
      transition.types?.add(`project-${passage.direction}`);
    } catch {
      // Direction attributes also support implementations without VT types.
    }

    transition.ready.then(
      () => {
        if (phase === 'in') releaseNames(record);
      },
      () => {
        if (phase === 'in') releaseNames(record);
      }
    );

    const settled = () => {
      if (!finishTransition(record) || phase !== 'in' || suspended) return;

      requestedQuiet = false;

      /*
       * Clear the temporary stage visibility and install the live entrance
       * animations in the same task, before another paint can flash the copy.
       */
      if (initialized) {
        runReveals(passage.direction === 'close');
      } else {
        queueReveals(passage.direction === 'close');
      }
    };

    transition.finished.then(settled, settled);
    return true;
  }

  function rememberFallbackReturn(passage) {
    if (!passage || passage.direction !== 'open' ||
        passage.navigationType !== 'push') return;

    const referrer = parseURL(document.referrer);
    const source = passage.from.url;

    /*
     * This narrow fallback is only for browsers without the Navigation API.
     * A changed history length or URL invalidates it; we never guess that an
     * arbitrary previous page is the collection.
     */
    if (!referrer ||
        referrer.origin !== source.origin ||
        referrer.pathname !== source.pathname ||
        referrer.search !== source.search ||
        window.history.length < 2) return;

    fallbackReturn = {
      url: window.location.href,
      length: window.history.length,
    };
  }

  function collectionHistoryDelta() {
    const currentRoute = routeFor(window.location.href);

    if (!documentMatches(currentRoute) || currentRoute?.kind !== 'project') {
      return null;
    }

    const navigation = window.navigation;

    if (navigation?.currentEntry && typeof navigation.entries === 'function') {
      try {
        const current = navigation.currentEntry;
        const entries = navigation.entries();
        let expectedIndex = current.index - 1;

        for (let index = entries.length - 1; index >= 0; index -= 1) {
          const entry = entries[index];
          if (entry.index >= current.index) continue;
          if (entry.index !== expectedIndex) return null;

          const route = routeFor(entry.url);
          if (!route) return null;

          if (route.kind === 'home') {
            return entry.index - current.index;
          }

          /*
           * #story and #support are real native history entries. Walk only
           * through entries belonging to this same project, then traverse to
           * the original collection entry in one native history operation.
           */
          if (route.kind !== 'project' || route.id !== currentRoute.id) {
            return null;
          }

          expectedIndex -= 1;
        }
      } catch {
        return null;
      }

      return null;
    }

    if (fallbackReturn &&
        fallbackReturn.url === window.location.href &&
        fallbackReturn.length === window.history.length) {
      return -1;
    }

    return null;
  }

  function isPlainAnchorActivation(event, anchor) {
    return !event.defaultPrevented &&
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      !anchor.hasAttribute('download') &&
      (!anchor.target || anchor.target.toLowerCase() === '_self');
  }

  /*
   * Project links are never intercepted. Only a verified collection-return
   * link becomes a native history traversal. Its href remains the full fallback
   * destination for direct visits, no-JS use, modified clicks and subdomains.
   */
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    const anchor = target?.closest('a[data-collection-return][href]');
    if (!anchor || !isPlainAnchorActivation(event, anchor)) return;

    const destination = parseURL(anchor.href);

    // Subdomain -> nkbr.cc is cross-origin: leave the real link entirely alone.
    if (!destination ||
        destination.origin !== window.location.origin ||
        destination.pathname !== '/') return;

    const delta = collectionHistoryDelta();
    if (!Number.isInteger(delta) || delta >= 0) return;

    try {
      window.history.go(delta);
      event.preventDefault();
    } catch {
      // The anchor's default navigation is still available.
    }
  });

  function cancelAnimations() {
    for (const animation of animations) animation.cancel();
    animations.clear();
  }

  function clearPointerLight() {
    if (lightFrame) window.cancelAnimationFrame(lightFrame);
    lightFrame = 0;
    pointerSample = null;

    if (litCard) delete litCard.dataset.light;
    litCard = null;
  }

  function stopOwnMotion() {
    if (observer) observer.disconnect();
    observer = null;

    if (revealFrame) window.cancelAnimationFrame(revealFrame);
    revealFrame = 0;

    cancelAnimations();
    clearPointerLight();
  }

  function animateEntrance(element, index) {
    if (revealed.has(element)) return;
    revealed.add(element);
    observer?.unobserve(element);

    if (reducedMotion.matches || typeof element.animate !== 'function') return;

    const kind = element.dataset.reveal;
    const stage = Number(element.dataset.detailStage || 0);
    const delay = stage
      ? Math.min(330, stage * 48 + Math.min(index, 3) * 22)
      : Math.min(index, 3) * 55;

    let frames = [
      { opacity: 0, transform: 'translateY(20px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ];
    let duration = 610;

    if (kind === 'icon') {
      frames = [
        { opacity: 0, transform: 'translateY(9px) rotate(-9deg) scale(.88)' },
        { opacity: 1, transform: 'translateY(0) rotate(0deg) scale(1)' },
      ];
      duration = 740;
    } else if (kind === 'index') {
      frames = [
        { opacity: 0, transform: 'translateY(16px) rotate(5deg)' },
        { opacity: 1, transform: 'translateY(0) rotate(0deg)' },
      ];
      duration = 720;
    } else if (kind === 'title' || kind === 'heading') {
      frames = [
        { opacity: 0, transform: 'translateY(16px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ];
      duration = 680;
    }

    try {
      const animation = element.animate(frames, {
        duration,
        delay,
        easing: 'cubic-bezier(.2,.8,.2,1)',
        fill: 'backwards',
      });

      animations.add(animation);
      const forget = () => animations.delete(animation);
      animation.addEventListener('finish', forget, { once: true });
      animation.addEventListener('cancel', forget, { once: true });
    } catch {
      // The unanimated document is already visible and fully usable.
    }
  }

  function runReveals(quiet = false) {
    if (!initialized || suspended || activeTransition ||
        document.visibilityState === 'hidden') return;

    requestedQuiet = false;
    if (observer) observer.disconnect();
    observer = null;

    const elements = Array.from(document.querySelectorAll('[data-reveal]'));

    if (reducedMotion.matches ||
        typeof window.IntersectionObserver !== 'function' ||
        typeof Element.prototype.animate !== 'function') {
      elements.forEach(element => revealed.add(element));
      return;
    }

    /*
     * AOS-inspired, one-shot fade-up, implemented with IO and WAAPI.
     * There is intentionally no default opacity:0 rule for data-reveal.
     * A native history return leaves already-visible collection cards alone.
     */
    const visible = elements.filter(element =>
      !revealed.has(element) && visibleInViewport(element)
    );

    visible.forEach((element, index) => {
      if (quiet) {
        revealed.add(element);
      } else {
        animateEntrance(element, index);
      }
    });

    observer = new IntersectionObserver(entries => {
      if (suspended || activeTransition || reducedMotion.matches) return;

      const arriving = entries
        .filter(entry => entry.isIntersecting && !revealed.has(entry.target))
        .sort((a, b) =>
          a.boundingClientRect.top - b.boundingClientRect.top ||
          a.boundingClientRect.left - b.boundingClientRect.left
        );

      arriving.forEach((entry, index) => {
        animateEntrance(entry.target, index);
      });
    }, {
      threshold: .04,
      rootMargin: '0px 0px -10px 0px',
    });

    elements.forEach(element => {
      if (!revealed.has(element)) observer.observe(element);
    });
  }

  function queueReveals(quiet = false) {
    requestedQuiet = requestedQuiet || quiet;
    if (revealFrame) window.cancelAnimationFrame(revealFrame);

    revealFrame = window.requestAnimationFrame(() => {
      revealFrame = 0;
      const quietPass = requestedQuiet;
      requestedQuiet = false;
      runReveals(quietPass);
    });
  }

  /*
   * Register both lifecycle listeners now, while this classic head script is
   * executing. Do not move these registrations into DOMContentLoaded.
   */
  window.addEventListener('pageswap', event => {
    suspended = true;
    stopOwnMotion();
    resetTransition();

    const activation = event.activation;
    let passage = null;

    if (activation?.entry?.url && activation.navigationType !== 'reload') {
      passage = makePassage(
        window.location.href,
        activation.entry.url,
        activation.navigationType
      );

      if (passage && !documentMatches(passage.from)) passage = null;
    }

    storePassage(passage);

    if (!bindTransition(event.viewTransition, passage, 'out')) {
      skipTransition(event.viewTransition);
    }
  });

  window.addEventListener('pagereveal', event => {
    suspended = false;
    stopOwnMotion();
    resetTransition();

    const passage = incomingPassage();
    rememberFallbackReturn(passage);

    if (bindTransition(event.viewTransition, passage, 'in')) return;

    /*
     * No matching visible endpoints, no activation identity, cross-origin,
     * unsupported transitions, or reduced motion: ordinary document navigation.
     */
    skipTransition(event.viewTransition);
    queueReveals(
      passage?.navigationType === 'traverse' || initialLoadWasTraversal()
    );
  });

  window.addEventListener('pagehide', () => {
    suspended = true;
    stopOwnMotion();

    /*
     * Do not remove outgoing names here: pageswap's snapshot may still need
     * them. Its finished promise, and the next activation's defensive cleanup,
     * own that work.
     */
    if (!activeTransition || activeTransition.phase !== 'out') {
      resetTransition();
    }
  });

  window.addEventListener('pageshow', event => {
    suspended = false;

    if (event.persisted) {
      stopOwnMotion();

      // Preserve an incoming capture if pagereveal has already run.
      if (!activeTransition || activeTransition.phase !== 'in') {
        resetTransition();
      }
    }

    queueReveals(event.persisted || initialLoadWasTraversal());
  });

  /*
   * Bounded, input-driven light positioning. Nine CSS-defined positions avoid
   * inline styles and per-frame stylesheet edits. No background animation loop
   * runs when the pointer is still or when a touch pointer is in use.
   */
  document.addEventListener('pointermove', event => {
    if (!finePointer.matches || reducedMotion.matches ||
        suspended || activeTransition) return;

    const target = event.target instanceof Element ? event.target : null;
    const card = target?.closest('.project-card');

    if (!card) {
      clearPointerLight();
      return;
    }

    if (card !== litCard) {
      clearPointerLight();
      litCard = card;
    }

    pointerSample = { x: event.clientX, y: event.clientY };
    if (lightFrame) return;

    lightFrame = window.requestAnimationFrame(() => {
      lightFrame = 0;
      if (!litCard || !pointerSample || suspended ||
          activeTransition || reducedMotion.matches) return;

      const rect = litCard.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const column = Math.max(0, Math.min(
        2,
        Math.floor((pointerSample.x - rect.left) / rect.width * 3)
      ));
      const row = Math.max(0, Math.min(
        2,
        Math.floor((pointerSample.y - rect.top) / rect.height * 3)
      ));
      const sector = ['nw', 'n', 'ne', 'w', 'c', 'e', 'sw', 's', 'se'][row * 3 + column];

      if (litCard.dataset.light !== sector) {
        litCard.dataset.light = sector;
      }
    });
  }, { passive: true });

  document.addEventListener('pointerout', event => {
    if (!event.relatedTarget) clearPointerLight();
  }, { passive: true });

  document.addEventListener('pointercancel', clearPointerLight, { passive: true });
  window.addEventListener('blur', clearPointerLight);

  function listenToMedia(query, handler) {
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', handler);
    } else if (typeof query.addListener === 'function') {
      query.addListener(handler);
    }
  }

  listenToMedia(reducedMotion, () => {
    stopOwnMotion();

    if (reducedMotion.matches) {
      resetTransition();
      document.querySelectorAll('[data-reveal]').forEach(element => {
        revealed.add(element);
      });
    } else {
      queueReveals(true);
    }
  });

  listenToMedia(finePointer, () => {
    if (!finePointer.matches) clearPointerLight();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      cancelAnimations();
      clearPointerLight();
    } else if (!suspended) {
      queueReveals(true);
    }
  });

  function initialize() {
    if (initialized) return;
    initialized = true;
    queueReveals(initialLoadWasTraversal());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
