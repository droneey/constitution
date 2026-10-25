import { describe, expect, it } from 'bun:test';

import type { Bold } from '../term.entity';
import { Term, TermKind } from '../term.entity';

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
