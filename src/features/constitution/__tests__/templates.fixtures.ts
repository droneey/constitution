import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const TEMPLATES = join(import.meta.dir, '..', '..', '..', '..', 'templates');
const PLACEHOLDER = /<[^>\n]+>/;

// What /ratify writes for Paraglide, a library the constitution has no block for.
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
    'owns: []',
    'owns: [Paraglide]',
  ],
  [
    '<Name>',
    'Paraglide',
  ],
  [
    '<What the library does in this repository, in one or two sentences.>',
    'Paraglide compiles the messages of each locale into typed functions.',
  ],
  [
    '<requirement>',
    'i18n-plurals-by-cldr',
  ],
  [
    '<how the library meets it>',
    'a variant per CLDR plural category',
  ],
  [
    '<met, partial: the workaround, or not met>',
    'met',
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
    '<tool — role, test or review>',
    'tool — types',
  ],
  [
    '<lens, lens>',
    'types',
  ],
];

const paraglideFromTemplate = (): string => {
  const filled = PARAGLIDE.reduce(
    (text, [placeholder, value]) => text.replaceAll(placeholder, value),
    readFileSync(join(TEMPLATES, 'block.md'), 'utf8'),
  );
  const left = PLACEHOLDER.exec(filled)?.[0];

  if (left !== undefined) {
    throw new Error(
      `templates/block.md has a placeholder no fill covers: ${left}`,
    );
  }

  return filled;
};

export { paraglideFromTemplate };
