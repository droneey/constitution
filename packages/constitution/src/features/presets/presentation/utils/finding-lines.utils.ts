import { reportLinesOf } from '#/shared/cli';

import type { PresetsFinding } from '../../domain/entities';
import { presetsFindingTextOf } from './presets-finding-text.utils';

const findingLinesOf = (findings: readonly PresetsFinding[]): readonly string[] =>
  reportLinesOf({
    findings,
    textOf: presetsFindingTextOf,
  });

export { findingLinesOf };
