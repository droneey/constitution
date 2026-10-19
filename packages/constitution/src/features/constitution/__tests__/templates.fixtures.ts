import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const TEMPLATES = join(import.meta.dir, '..', '..', '..', '..', 'templates');
const PLACEHOLDER = /<[^>\n]+>/;
const PARAGLIDE_DIR = 'blocks/implementations/paraglide';

// What /ratify writes for Paraglide, a library the Constitution has no block for.
const PARAGLIDE: ReadonlyArray<
  readonly [
    string,
    string,
  ]
> = [
  [
    '<id>',
    'paraglide',
  ],
  [
    '<One sentence of at most 70 characters.>',
    'Paraglide messages, compiled per locale.',
  ],
  [
    'requires: []',
    'requires: [i18n, typescript]',
  ],
  [
    'dictionary: []',
    'dictionary: [Paraglide]',
  ],
  [
    '<Name>',
    'Paraglide',
  ],
  [
    '<What the library does in this repository, in one sentence.>',
    'Paraglide compiles the messages of each locale into typed functions.',
  ],
  [
    '<How the library is set up in this repository: its preset parts, templates, configuration files and exclusions.>',
    'Its compiler runs before the type check, and its output is ignored.',
  ],
  [
    '<Chapter>',
    'Messages',
  ],
  [
    "<what this chapter's rules govern, in a few words>",
    'how a message is read',
  ],
  [
    '<requirement>',
    'i18n-plurals-by-cldr',
  ],
  [
    '<how the library meets it; for partly or no, the rule of this block, its slug in backticks, that covers what it misses or replaces the requirement>',
    'a variant per CLDR plural category',
  ],
  [
    '<yes, it meets the rule as written; partly, it meets its purpose or part of its letter; no, it cannot meet it>',
    'yes',
  ],
  [
    '<rule-slug>',
    'paraglide-messages-by-function',
  ],
  [
    '<The rule, in one or two sentences.>',
    'A message is read through its compiled function, never by its key.',
  ],
  [
    '<the reason>',
    'the compiler checks a function call, and a key is only a string.',
  ],
  [
    '[<lens>, <lens>]',
    '[errors]',
  ],
];

/** a file of templates/block/, its placeholders filled for Paraglide */
const paraglideFromTemplate = (path: string): string => {
  const filled = PARAGLIDE.reduce(
    (text, [placeholder, filling]) => text.replaceAll(placeholder, filling),
    readFileSync(join(TEMPLATES, 'block', path), 'utf8'),
  );
  const left = PLACEHOLDER.exec(filled)?.[0];

  if (left !== undefined) {
    throw new Error(`templates/block/${path} has a placeholder no fill covers: ${left}`);
  }

  return filled;
};

/**
 * the block /ratify writes for Paraglide from templates/block/: block.md named paraglide.md, and
 * chapter.md named after its subject
 */
const paraglideCard = (): Readonly<Record<string, string>> => ({
  [`${PARAGLIDE_DIR}/paraglide.md`]: paraglideFromTemplate('block.md'),
  [`${PARAGLIDE_DIR}/foundation/messages.md`]: paraglideFromTemplate('foundation/chapter.md'),
});

export { paraglideCard };
