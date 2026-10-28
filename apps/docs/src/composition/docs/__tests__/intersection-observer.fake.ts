export interface ViewportFake {
  restore: () => void;
  show: (...ids: string[]) => void;
}

export const viewportFake = (): ViewportFake => {
  const original = globalThis.IntersectionObserver;
  const observers: IntersectionObserverFake[] = [];

  class IntersectionObserverFake implements IntersectionObserver {
    readonly root = document;
    readonly rootMargin = '0px';
    readonly scrollMargin = '0px';
    readonly thresholds = [];
    readonly targets: Element[] = [];
    readonly callback: IntersectionObserverCallback;

    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
      observers.push(this);
    }

    observe(target: Element): void {
      this.targets.push(target);
    }

    unobserve(): void {
      // Why: the fake reports every target it was given until it disconnects.
    }

    disconnect(): void {
      observers.splice(observers.indexOf(this), 1);
    }

    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  globalThis.IntersectionObserver = IntersectionObserverFake;

  return {
    show: (...ids: string[]): void => {
      for (const observer of observers) {
        observer.callback(
          observer.targets.map((target) => {
            const bounds = target.getBoundingClientRect();
            const onScreen = ids.includes(target.id);

            return {
              boundingClientRect: bounds,
              intersectionRatio: onScreen ? 1 : 0,
              intersectionRect: bounds,
              isIntersecting: onScreen,
              rootBounds: document.documentElement.getBoundingClientRect(),
              target,
              time: 0,
            };
          }),
          observer,
        );
      }
    },
    restore: (): void => {
      globalThis.IntersectionObserver = original;
    },
  };
};
