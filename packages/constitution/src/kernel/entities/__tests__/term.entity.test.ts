import { describe, expect, it } from 'bun:test';

import type { Bold, TermsRead } from '../term.entity';
import { Term, TermKind } from '../term.entity';

const termOf = (kind: TermKind, term: string): Term => ({
  kind,
  term,
});

describe('Term.of', () => {
  it.each<{
    bold: Bold;
    condition: string;
    expected: Term;
  }>([
    {
      bold: {
        isCode: false,
        text: 'binding unit',
      },
      condition: 'plain lower-case words name a concept',
      expected: {
        kind: TermKind.Concept,
        term: 'binding unit',
      },
    },
    {
      bold: {
        isCode: false,
        text: 'Ubiquitous language.',
      },
      condition: 'a lead-in opens its sentence with a capital',
      expected: {
        kind: TermKind.Concept,
        term: 'ubiquitous language',
      },
    },
    {
      bold: {
        isCode: false,
        text: 'TanStack Start:',
      },
      condition: 'a lead-in names a brand',
      expected: {
        kind: TermKind.Brand,
        term: 'TanStack Start',
      },
    },
    {
      bold: {
        isCode: false,
        text: 'Unit',
      },
      condition: 'a capital opens words that are no lead-in',
      expected: {
        kind: TermKind.Brand,
        term: 'Unit',
      },
    },
    {
      bold: {
        isCode: true,
        text: 'widgets/',
      },
      condition: 'a code span ends with a slash',
      expected: {
        kind: TermKind.Folder,
        term: 'widgets/',
      },
    },
    {
      bold: {
        isCode: true,
        text: '.stories',
      },
      condition: 'a code span opens with a dot',
      expected: {
        kind: TermKind.Suffix,
        term: '.stories',
      },
    },
    {
      bold: {
        isCode: true,
        text: 'routeTree.gen.ts',
      },
      condition: 'a code span is a name with an extension',
      expected: {
        kind: TermKind.File,
        term: 'routeTree.gen.ts',
      },
    },
    {
      bold: {
        isCode: true,
        text: 'tsconfig.json#paths',
      },
      condition: 'a code span names a member of a file',
      expected: {
        kind: TermKind.Api,
        term: 'tsconfig.json#paths',
      },
    },
  ])('should name the term when $condition', ({ bold, expected }) => {
    // Act
    const term = Term.of(bold);

    // Assert
    expect(term).toStrictEqual(expected);
  });
});

describe('Term.allIn', () => {
  it.each<{
    expected: TermsRead;
    name: string;
    text: string;
  }>([
    {
      expected: {
        misshapen: [],
        terms: [
          termOf(TermKind.Concept, 'binding unit'),
          termOf(TermKind.Concept, 'end-to-end'),
        ],
      },
      name: 'plain lower-case words',
      text: 'A **binding unit** runs **end-to-end**.',
    },
    {
      expected: {
        misshapen: [],
        terms: [
          termOf(TermKind.Concept, 'ubiquitous language'),
          termOf(TermKind.Concept, 'unit'),
          termOf(TermKind.Brand, 'TanStack Start'),
        ],
      },
      name: 'lead-ins closed by a full stop or a colon',
      text: '- **Ubiquitous language.** Names.\n- **Unit:** one boundary.\n- **TanStack Start.** A framework.',
    },
    {
      expected: {
        misshapen: [],
        terms: [
          termOf(TermKind.Brand, 'React'),
          termOf(TermKind.Brand, 'PEP 695'),
          termOf(TermKind.Brand, 'Unit'),
          termOf(TermKind.Brand, 'Next.js'),
        ],
      },
      name: 'capitals and digits outside a lead-in',
      text: '**React** and **PEP 695**; **Unit** tests on **Next.js**.',
    },
    {
      expected: {
        misshapen: [],
        terms: [
          termOf(TermKind.Folder, 'widgets/'),
          termOf(TermKind.Suffix, '.stories'),
          termOf(TermKind.File, 'renovate.json'),
          termOf(TermKind.Api, 'createServerFn'),
          termOf(TermKind.Api, 'bun:test'),
          termOf(TermKind.File, 'routeTree.gen.ts'),
          termOf(TermKind.Api, 'node:fs.promises'),
          termOf(TermKind.Api, 'tsconfig.json#paths'),
        ],
      },
      name: 'one code span each',
      text: '**`widgets/`**, **`.stories`**, **``renovate.json``**, **`createServerFn`**, **`bun:test`**, **`routeTree.gen.ts`**, **`node:fs.promises`** and **`tsconfig.json#paths`**.',
    },
    {
      expected: {
        misshapen: [],
        terms: [
          termOf(TermKind.Concept, 'composition root'),
        ],
      },
      name: 'a line break inside one',
      text: 'The **composition\nroot** wires.',
    },
    {
      expected: {
        misshapen: [],
        terms: [],
      },
      name: 'globs in code spans, a fenced sample and a blank line between the asterisks',
      text: 'Specs under `**/__tests__/**`, `**/main.*`, and `**/root/**`.\n\n```md\n**fenced**\n```\n\nA ** loose\n\npair **, a **loose\n  \npair** and a **lone\n\npair**.',
    },
    {
      expected: {
        misshapen: [
          'the `x` folder',
          '[core](core.md)',
          '`a` `b`',
        ],
        terms: [],
      },
      name: 'bold that is neither plain words nor one code span',
      text: 'See **the `x` folder**, **[core](core.md)** and **`a` `b`**.',
    },
  ])('should read the terms of $name', ({ expected, text }) => {
    // Act
    const read = Term.allIn(text);

    // Assert
    expect(read).toStrictEqual(expected);
  });
});

describe('Term.matcherOf', () => {
  it.each<{
    expected: boolean;
    name: string;
    term: Term;
    text: string;
  }>([
    {
      expected: true,
      name: 'a concept in capitals and the plural',
      term: termOf(TermKind.Concept, 'use case'),
      text: 'Two Use Cases meet.',
    },
    {
      expected: true,
      name: 'a folder inside a path',
      term: termOf(TermKind.Folder, 'adapters/'),
      text: 'Open src/adapters/http.',
    },
    {
      expected: true,
      name: 'a suffix inside a file name',
      term: termOf(TermKind.Suffix, '.port'),
      text: 'Name it x.port.ts.',
    },
    {
      expected: false,
      name: 'a suffix that runs on past a hyphen',
      term: termOf(TermKind.Suffix, '.port'),
      text: 'Name it x.port-x.',
    },
    {
      expected: true,
      name: 'a brand as written',
      term: termOf(TermKind.Brand, 'React'),
      text: 'Write React-based screens.',
    },
    {
      expected: true,
      name: 'a brand that opens with a dot at the end of a longer name',
      term: termOf(TermKind.Brand, '.NET'),
      text: 'Serve it with ASP.NET.',
    },
    {
      expected: false,
      name: 'a brand in other capitals',
      term: termOf(TermKind.Brand, 'React'),
      text: 'Components react to props.',
    },
    {
      expected: true,
      name: 'a file name after a path',
      term: termOf(TermKind.File, 'index.ts'),
      text: 'Each src/index.ts re-exports.',
    },
  ])('should tell whether text uses $name', ({ expected, term, text }) => {
    // Arrange
    const matcher = Term.matcherOf(term);

    // Act
    const matches = matcher(text);

    // Assert
    expect(matches).toBe(expected);
  });
});

describe('Term.otherSpellingOf', () => {
  it.each<{
    expected: string | undefined;
    term: Term;
  }>([
    {
      expected: 'widgets',
      term: termOf(TermKind.Folder, 'widgets/'),
    },
    {
      expected: 'stories',
      term: termOf(TermKind.Suffix, '.stories'),
    },
    {
      expected: undefined,
      term: termOf(TermKind.File, 'renovate.json'),
    },
  ])('should spell $term.kind $term.term as $expected', ({ expected, term }) => {
    // Act
    const other = Term.otherSpellingOf(term);

    // Assert
    expect(other).toBe(expected);
  });
});
