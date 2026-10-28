import { z } from 'zod';

import { UnitRelativePath } from '#/kernel/value-objects';

/** The settings of the specs in a `bunfig.toml`, each left out taken as `bun test` takes it. */
interface SpecSettings {
  readonly test: {
    readonly pathIgnorePatterns: readonly string[];
    readonly root: UnitRelativePath;
  };
}

const UNIT_FOLDER_PATH = '';

const specSettingsModel: z.ZodType<SpecSettings> = z.object({
  test: z
    .object({
      // Stryker disable next-line ArrayDeclaration: a pattern that names no spec leaves out none, as no pattern does
      pathIgnorePatterns: z.array(z.string()).default([]),
      root: z
        .string()
        .refine(UnitRelativePath.is)
        .transform(UnitRelativePath.create)
        .prefault(UNIT_FOLDER_PATH),
    })
    .prefault({}),
});

export type { SpecSettings };
export { specSettingsModel };
