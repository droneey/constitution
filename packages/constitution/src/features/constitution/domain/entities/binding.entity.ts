import type { Axis } from '#/kernel/constants';

import type { FieldIssue } from './manifest.entity';

// part → rule → the settings that hold it, for the axis whose folder holds the file
type BindingsDocument = Readonly<Record<string, Readonly<Record<string, readonly string[]>>>>;

type BindingsRead =
  | {
      readonly document: BindingsDocument;
      readonly status: 'parsed';
    }
  | {
      readonly reason: string;
      readonly status: 'not-yaml';
    }
  | {
      readonly issues: readonly FieldIssue[];
      readonly status: 'mismatched';
    };

interface Binding {
  readonly axis: Axis;
  readonly file: string;
  readonly part: string;
  readonly rule: string;
  readonly scope: string;
  readonly setting: string;
  readonly tool: string;
}

interface PresetFile {
  readonly path: string;
  readonly text: string;
}

export type { Binding, BindingsDocument, BindingsRead, PresetFile };
