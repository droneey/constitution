import type { UnitRelativePath } from '#/kernel/value-objects';

interface CodeComparer {
  readonly hasCodeChanged: (filePath: UnitRelativePath, baseText?: string) => boolean;
}

export type { CodeComparer };
