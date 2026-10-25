interface ChildProcessSettings {
  readonly env: Readonly<Record<string, string>>;
  readonly timeoutMs: number;
}

export type { ChildProcessSettings };
