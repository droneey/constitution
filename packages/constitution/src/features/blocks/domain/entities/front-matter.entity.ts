import type { BlockId, Glob } from '#/kernel/value-objects';

/** The fields of a passport's front matter, in the order it lists them. */
enum FrontMatterField {
  Id = 'id',
  Summary = 'summary',
  Requires = 'requires',
  Extends = 'extends',
  Abstract = 'abstract',
  Languages = 'languages',
  Governs = 'governs',
}

interface FrontMatter {
  readonly abstract: boolean;
  readonly extends?: BlockId;
  readonly governs: readonly Glob[];
  readonly id: BlockId;
  readonly languages: readonly BlockId[];
  readonly requires: readonly BlockId[];
  readonly summary: string;
}

const FrontMatter = {
  create: (input: FrontMatter): FrontMatter => ({
    abstract: input.abstract,
    ...(input.extends === undefined
      ? {}
      : {
          extends: input.extends,
        }),
    governs: input.governs,
    id: input.id,
    languages: input.languages,
    requires: input.requires,
    summary: input.summary,
  }),
} as const;

export { FrontMatter, FrontMatterField };
