import { describe, expect, it } from 'bun:test';

import type { Term, TermsRead } from '../terms.utils';
import { otherSpellingOf, TermKind, termMatcher, termsIn } from '../terms.utils';

const termOf = (kind: TermKind, term: string): Term => ({
  kind,
  term,
});

describe('termsIn', () => {
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
    const read = termsIn(text);

    // Assert
    expect(read).toStrictEqual(expected);
  });
});

describe('termMatcher', () => {
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
    // Act
    const matches = termMatcher(term)(text);

    // Assert
    expect(matches).toBe(expected);
  });
});

describe('otherSpellingOf', () => {
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
    const other = otherSpellingOf(term);

    // Assert
    expect(other).toBe(expected);
  });
});
