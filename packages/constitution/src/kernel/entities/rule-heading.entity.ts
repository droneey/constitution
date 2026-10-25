import type { Level } from '../constants';
import { LEVELS } from '../constants';

/** A rule as its heading names it: one that tightens another may leave its level to the chain. */
interface RuleHeading {
  readonly level?: Level;
  readonly slug: string;
  readonly tightens?: string;
}

const HEADING = /^(\S+)(?: → (\S+))?(?: · (\S+))?$/;

/**
 * The rule a heading names, from the text after its `### `: `<slug> · <level>`, or
 * `<slug> → <rule>` with its level or without; undefined for a heading that names no rule.
 */
const of = (text: string): RuleHeading | undefined => {
  const match = HEADING.exec(text);
  const word = match?.[3];
  const level = LEVELS.find((candidate) => candidate === word);

  if (
    match === null ||
    (word !== undefined && level === undefined) ||
    (word === undefined && match[2] === undefined)
  ) {
    return undefined;
  }

  const tightens = match[2];

  return {
    ...(level === undefined
      ? {}
      : {
          level,
        }),
    // Stryker disable next-line StringLiteral: the pattern always captures the slug
    slug: match[1] ?? '',
    ...(tightens === undefined
      ? {}
      : {
          tightens,
        }),
  };
};

const RuleHeading = {
  of,
} as const;

export { RuleHeading };
