import type { Axis } from '#/kernel';

import type { FieldIssue } from './manifest.entity';

// part → rule → the settings that hold it
type AxisBindings = Readonly<
  Record<string, Readonly<Record<string, readonly string[]>>>
>;

type BindingsDocument = Partial<Readonly<Record<Axis, AxisBindings>>>;

type BindingsRead =
  | {
      document: BindingsDocument;
      status: 'parsed';
    }
  | {
      reason: string;
      status: 'not-yaml';
    }
  | {
      issues: readonly FieldIssue[];
      status: 'mismatched';
    };

interface Binding {
  axis: Axis;
  file: string;
  part: string;
  rule: string;
  scope: string;
  setting: string;
  tool: string;
}

interface PresetFile {
  path: string;
  text: string;
}

export type { Binding, BindingsDocument, BindingsRead, PresetFile };
