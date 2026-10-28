import type { BlockId } from '#/kernel/value-objects';

import { PresetValue } from './preset-value.entity';
import { Setting } from './setting.entity';

type MarkStep =
  | string
  | {
      readonly field: string;
      readonly value: string;
    }
  | {
      readonly item: Setting;
    };

interface BlockMark {
  readonly block: BlockId;
  readonly keyPath: readonly MarkStep[];
}

interface BlockMarks {
  readonly blocks: readonly BlockId[];
  readonly marks: readonly BlockMark[];
}

type HeldStep =
  | {
      readonly item: Setting;
    }
  | {
      readonly key: string;
    };

const isStepOf = (step: MarkStep, held: HeldStep): boolean => {
  if (typeof step === 'string') {
    return 'key' in held && held.key === step;
  }

  // Stryker disable next-line ConditionalExpression: a key holds no item either way; the test only narrows the type
  const listed = 'item' in held ? held.item : undefined;

  if ('item' in step) {
    return PresetValue.isFilledFrom(step.item, listed);
  }

  const named = Setting.isMap(listed) ? listed[step.field] : undefined;

  return Setting.isScalar(named) && String(named) === step.value;
};

const isPathOf = (steps: readonly MarkStep[], keyPath: readonly HeldStep[]): boolean => {
  const [step, ...rest] = steps;
  const [held, ...others] = keyPath;

  if (step === undefined || held === undefined) {
    return step === held;
  }

  return isStepOf(step, held) && isPathOf(rest, others);
};

const blockAt = (marks: BlockMarks, keyPath: readonly HeldStep[]): BlockId | undefined =>
  marks.marks.find((mark) => isPathOf(mark.keyPath, keyPath))?.block;

const BlockMarks = {
  blockAt,
  isStepOf,
} as const;

export type { BlockMark, HeldStep, MarkStep };
export { BlockMarks };
