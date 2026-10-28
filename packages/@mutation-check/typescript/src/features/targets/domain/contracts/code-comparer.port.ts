import type { UnitRelativePath } from '#/kernel/value-objects';

interface CodeComparer {
  /**
   * Whether the file's code differs from its base's, not only its formatting; with no base text, the
   * main line never had the file.
   */
  readonly hasCodeChanged: (filePath: UnitRelativePath, baseText?: string) => boolean;
}

export type { CodeComparer };
