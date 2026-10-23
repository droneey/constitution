import { attempted, isSyntaxError } from '#/kernel/utils';

import type { ActiveBlock } from '../entities';

// A block's globs, as the reminders and the gate match a path from the folder of its unit: "**/"
// any folders or none, "**" anything, "*" and "?" within a folder, "{a,b}" either.
const SPECIAL = '.+^$|()[]\\';

const insideBraces = (input: { at: number; glob: string }): boolean => {
  let open = 0;

  for (const character of input.glob.slice(0, input.at)) {
    open += character === '{' ? 1 : 0;
    open -= character === '}' ? 1 : 0;
  }

  return open > 0;
};

const PIECES: ReadonlyMap<string, string> = new Map([
  [
    '*',
    '[^/]*',
  ],
  [
    '?',
    '[^/]',
  ],
  [
    '{',
    '(',
  ],
  [
    '}',
    ')',
  ],
]);

const globPatternOf = (glob: string): string => {
  let pattern = '';

  for (let at = 0; at < glob.length; at += 1) {
    const character = glob.charAt(at);

    if (glob.startsWith('**/', at)) {
      pattern += '(.*/)?';
      at += 2;
    } else if (glob.startsWith('**', at)) {
      pattern += '.*';
      at += 1;
    } else if (
      character === ',' &&
      insideBraces({
        at,
        glob,
      })
    ) {
      pattern += '|';
    } else if (SPECIAL.includes(character)) {
      pattern += `\\${character}`;
    } else {
      pattern += PIECES.get(character) ?? character;
    }
  }

  return `^${pattern}$`;
};

// A glob whose braces do not pair matches nothing.
const NOTHING = /(?!)/u;

const patternOf = (glob: string): RegExp =>
  attempted({
    effect: () => new RegExp(globPatternOf(glob), 'u'),
    isRecognised: isSyntaxError,
  }) ?? NOTHING;

const isGoverned = (input: { globs: readonly string[]; path: string }): boolean =>
  input.globs.some((glob) => patternOf(glob).test(input.path));

// The active blocks that govern a path from the project's folder, in their order, each once: those
// of the deepest package the path lies in, or the repository's.
const governingOf = (input: {
  active: readonly ActiveBlock[];
  path: string;
}): readonly ActiveBlock[] => {
  const unit = input.active
    .filter(
      (block) =>
        block.scope !== 0 && block.app !== '' && `${input.path}/`.startsWith(`${block.app}/`),
    )
    .reduce<ActiveBlock | undefined>(
      (deepest, block) =>
        deepest === undefined || block.app.length > deepest.app.length ? block : deepest,
      undefined,
    );
  const scope = unit?.scope ?? 0;
  const inner = unit === undefined ? input.path : input.path.slice(unit.app.length + 1);
  const seen = new Set<string>();

  return input.active.filter((block) => {
    if (
      block.scope !== scope ||
      seen.has(block.id) ||
      !isGoverned({
        globs: block.globs,
        path: inner,
      })
    ) {
      return false;
    }

    seen.add(block.id);

    return true;
  });
};

export { governingOf };
