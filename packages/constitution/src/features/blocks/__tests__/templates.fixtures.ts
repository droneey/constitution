import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const templates = join(import.meta.dir, '..', '..', '..', '..', 'templates');
const PLACEHOLDER = /<[^>\n]+>/;
const PARAGLIDE_DIR = 'blocks/implementations/paraglide';

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
    '<Name>',
    'Paraglide',
  ],
  [
    '<What the library does in this repository, in one sentence that sets its name in bold, which defines it.>',
    '**Paraglide** compiles the messages of each locale into typed functions.',
  ],
  [
    '<What its preset entries and templates cannot show: how the library is set up, a quirk of the tool, a limit of what it holds.>',
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
    '<rule slug>',
    'paraglide-messages-by-function',
  ],
  [
    '<Its slogan: the shortest true statement of the outcome it asks for.>',
    'A message is read through its compiled function.',
  ],
  [
    "<The sentences that draw the slogan's limits: where it applies, what it covers, its exceptions.>",
    'No code reads one by its key.',
  ],
  [
    '<the failure it prevents: what breaks, for whom, when the rule is broken> — <the principle, pattern or reference it applies or follows; drop this part and its dash when it follows none>',
    'a message read by its key breaks for its reader once the key is renamed, since the compiler checks a function call and a key is only a string.',
  ],
] as const;

const paraglideFromTemplate = (path: string): string => {
  const filled = PARAGLIDE.reduce(
    (text, [placeholder, filling]) => text.replaceAll(placeholder, filling),
    readFileSync(join(templates, 'block', path), 'utf8'),
  );
  const left = PLACEHOLDER.exec(filled)?.[0];

  if (left !== undefined) {
    throw new Error(`templates/block/${path} has a placeholder no fill covers: ${left}`);
  }

  return filled;
};

const paraglideCard = (): Readonly<Record<string, string>> => ({
  [`${PARAGLIDE_DIR}/paraglide.md`]: paraglideFromTemplate('block.md'),
  [`${PARAGLIDE_DIR}/foundation/messages.md`]: paraglideFromTemplate('foundation/chapter.md'),
});

export { paraglideCard };
