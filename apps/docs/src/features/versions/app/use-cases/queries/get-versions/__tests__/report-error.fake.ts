export interface ReportErrorFake {
  readonly reported: unknown[];
  readonly restore: () => void;
}

/** Bun fails the running spec on a reported error, so a spec that expects one takes this fake */
export const reportErrorFake = (): ReportErrorFake => {
  const reported: unknown[] = [];
  const original = globalThis.reportError;

  globalThis.reportError = (error: unknown): void => {
    reported.push(error);
  };

  return {
    reported,
    restore: (): void => {
      globalThis.reportError = original;
    },
  };
};
