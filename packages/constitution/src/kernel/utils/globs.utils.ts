import { attempted, isSyntaxError } from './failures.utils';

// A block's globs, as they match a path from the folder of its unit: "**/" any folders or none,
// "**" anything, "*" and "?" within a folder, "{a,b}" either.
const SPECIAL = '.+^$|()[]\\';

const insideBraces = (input: { at: number; glob: string }): boolean => {
  let open = 0;

  for (const character of input.glob.slice(0, input.at)) {
    open += character === '{' ? 1 : 0;
    open -= character === '}' ? 1 : 0;
  }

  return open > 0;
};

const pieces: ReadonlyMap<string, string> = new Map([
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
      pattern += pieces.get(character) ?? character;
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

export { isGoverned };
