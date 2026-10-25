import type { PartAddress, RuleSlug } from '#/kernel/value-objects';

import type { FieldIssue, ReadStatus } from './document-read.entity';

/** part → rule → the settings that hold it, for the axis whose folder holds the file */
type BindingsDocument = Readonly<Record<string, Readonly<Record<string, readonly string[]>>>>;

type BindingsRead =
  | {
      readonly document: BindingsDocument;
      readonly status: ReadStatus.Parsed;
    }
  | {
      readonly reason: string;
      readonly status: ReadStatus.NotYaml;
    }
  | {
      readonly issues: readonly FieldIssue[];
      readonly status: ReadStatus.Mismatched;
    };

interface Binding {
  readonly file: string;
  readonly part: PartAddress;
  readonly rule: RuleSlug;
  readonly setting: string;
}

const Binding = {
  create: (input: Binding): Binding => ({
    file: input.file,
    part: input.part,
    rule: input.rule,
    setting: input.setting,
  }),
} as const;

interface PresetFile {
  readonly path: string;
  readonly text: string;
}

export type { BindingsDocument, BindingsRead, PresetFile };
export { Binding };
