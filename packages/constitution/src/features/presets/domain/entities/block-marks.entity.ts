import { Setting } from './setting.entity';

/**
 * One step from a map or a list to what it holds: a key, an item of the list told by its value, or
 * an element of maps told by one field's value.
 */
type MarkStep =
  | string
  | {
      readonly field: string;
      readonly value: string;
    }
  | {
      readonly item: Setting;
    };

/** A key or an item one block alone gives, everything below it included. */
interface BlockMark {
  readonly block: string;
  readonly path: readonly MarkStep[];
}

/**
 * What the presets give a file, by block: each mark, in the order the merge meets it, and every
 * block an entry of the file's path names, whose comment naming it is constitution's own.
 */
interface BlockMarks {
  readonly blocks: readonly string[];
  readonly marks: readonly BlockMark[];
}

/** A key of a map, or an item of a list by its value, as a file holds it. */
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
    return Setting.same(step.item, listed);
  }

  const named = Setting.isMap(listed) ? listed[step.field] : undefined;

  return Setting.isScalar(named) && String(named) === step.value;
};

const isPathOf = (steps: readonly MarkStep[], path: readonly HeldStep[]): boolean => {
  const [step, ...rest] = steps;
  const [held, ...others] = path;

  if (step === undefined || held === undefined) {
    return step === held;
  }

  return isStepOf(step, held) && isPathOf(rest, others);
};

const blockAt = (marks: BlockMarks, path: readonly HeldStep[]): string | undefined =>
  marks.marks.find((mark) => isPathOf(mark.path, path))?.block;

const BlockMarks = {
  blockAt,
  isStepOf,
} as const;

export type { BlockMark, HeldStep, MarkStep };
export { BlockMarks };
