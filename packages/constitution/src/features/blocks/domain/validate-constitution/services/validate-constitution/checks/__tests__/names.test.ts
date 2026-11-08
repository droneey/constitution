import { describe, expect, it } from 'bun:test';

import type { FindingOf } from '#/kernel/types';
import { BlockId } from '#/kernel/value-objects';

import type { Files } from '../../../../../../__tests__/constitution.fixtures';
import { chapterFile, rule } from '../../../../../../__tests__/constitution.fixtures';
import { nestedFiles, nestedPassportFile } from '../../../../../../__tests__/nested-files.fixtures';
import { checkInputOf } from '../../../../../../application/use-cases/queries/check/__tests__/check.fixtures';
import type { NamesDetails } from '../names';
import { NamesCode, namesCheck } from '../names';

const CODE = 'blocks/core/@foundation/code.md';
const SCREENS = 'blocks/domains/presentation/@foundation/screens.md';
const STORAGE = 'blocks/contexts/platforms/client/browser/@foundation/storage.md';
const HOOKS = 'blocks/implementations/react/@architecture/hooks.md';
const REACT_DOM = 'blocks/implementations/react/react-dom/@foundation/portals.md';
const CORE = 'blocks/core/core.md';
const UVX = 'blocks/implementations/uvx/uvx.md';

type NamesFinding = FindingOf<NamesDetails>;

const titledFiles = (): Files => ({
  ...nestedFiles(),
  'blocks/contexts/languages/typescript/typescript.md': nestedPassportFile({
    body: '# TS\n\n> Typed scripts.\n',
    id: 'typescript',
  }),
  'blocks/contexts/languages/kotlin/kotlin.md': nestedPassportFile({
    body: '# Kotlin\n\n> A language of the JVM.\n',
    id: 'kotlin',
  }),
  'blocks/domains/presentation/presentation.md': nestedPassportFile({
    body: '# Presentation\n\n> What users see.\n',
    id: 'presentation',
  }),
  'blocks/implementations/uvx/uvx.md': nestedPassportFile({
    body: '# uvx\n\n> Runs a tool.\n',
    id: 'uvx',
  }),
  'blocks/implementations/poe/poe.md': nestedPassportFile({
    body: '# Poe the Poet\n\n> Runs tasks.\n',
    id: 'poe',
  }),
  'blocks/contexts/languages/plain/plain.md': nestedPassportFile({
    body: '> A language with no title.\n',
    id: 'plain',
  }),
  'blocks/implementations/untitled/untitled.md': nestedPassportFile({
    body: '> A block with no title.\n',
    id: 'untitled',
  }),
  'blocks/implementations/react/react.md': nestedPassportFile({
    body: '# React \n\n> Components.\n',
    id: 'react',
    requires: [
      'presentation',
      'typescript',
    ],
  }),
  'blocks/implementations/react/react-dom/react-dom.md': nestedPassportFile({
    body: '# React DOM\n\n> Components in a page.\n',
    id: 'react/react-dom',
    requires: [
      'client/browser',
    ],
  }),
  'blocks/implementations/task-runner/task-runner.md': nestedPassportFile({
    body: '# Task runner\n\n> Runs tasks.\n',
    id: 'task-runner',
  }),
});

const chapterSaying = (title: string, statement: string): string =>
  chapterFile(
    title,
    rule({
      slug: `${title.toLowerCase()}-holds`,
      statement,
    }),
  );

const checked = (input: { path: string; text: string }): readonly NamesFinding[] => {
  const files = titledFiles();

  files[input.path] = input.text;

  return namesCheck(checkInputOf(files));
};

describe('namesCheck', () => {
  it('should find nothing when every block names only what it reaches', () => {
    // Act
    const findings = namesCheck(checkInputOf(titledFiles()));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each<{
    expected: readonly NamesFinding[];
    name: string;
    path: string;
    text: string;
  }>([
    {
      expected: [
        {
          code: NamesCode.CoreNamesProduct,
          details: {
            name: 'Docker',
          },
          path: CODE,
        },
        {
          code: NamesCode.CoreNamesProduct,
          details: {
            name: 'TypeScript',
          },
          path: CODE,
        },
      ],
      name: 'a chapter of core names a tool and a language',
      path: CODE,
      text: chapterSaying('Code', 'Every program runs in Docker and is written in TypeScript.'),
    },
    {
      expected: [
        {
          code: NamesCode.ProductOutOfReach,
          details: {
            name: 'React',
            owner: BlockId.create('react'),
          },
          path: SCREENS,
        },
      ],
      name: 'a domain names a product of an implementation',
      path: SCREENS,
      text: chapterSaying('Screens', 'Every screen is a React component.'),
    },
    {
      expected: [
        {
          code: NamesCode.ParentNamesChild,
          details: {
            child: BlockId.create('react/react-dom'),
            name: 'React DOM',
          },
          path: HOOKS,
        },
      ],
      name: 'a parent names the product of its child',
      path: HOOKS,
      text: chapterSaying('Hooks', 'Every hook runs under React DOM.'),
    },
    {
      expected: [
        {
          code: NamesCode.ProductOfNoBlock,
          details: {
            name: 'Chrome',
          },
          path: REACT_DOM,
        },
      ],
      name: 'a child names its parent, and a product no block holds',
      path: REACT_DOM,
      text: chapterSaying('Portals', 'Every portal of React renders in Chrome.'),
    },
    {
      expected: [
        {
          code: NamesCode.ProductOutOfReach,
          details: {
            name: 'TypeScript',
            owner: BlockId.create('typescript'),
          },
          path: STORAGE,
        },
      ],
      name: 'a platform names a language it does not require',
      path: STORAGE,
      text: chapterSaying('Storage', 'Every tab reads its storage through TypeScript.'),
    },
    {
      expected: [
        {
          code: NamesCode.ProductOutOfReach,
          details: {
            name: 'Kotlin',
            owner: BlockId.create('kotlin'),
          },
          path: STORAGE,
        },
      ],
      name: 'a platform names a language whose title alone names it',
      path: STORAGE,
      text: chapterSaying('Storage', 'Every tab is read by Kotlin.'),
    },
    {
      expected: [
        {
          code: NamesCode.ProductOutOfReach,
          details: {
            name: 'Poe the Poet',
            owner: BlockId.create('poe'),
          },
          path: SCREENS,
        },
        {
          code: NamesCode.ProductOutOfReach,
          details: {
            name: 'uvx',
            owner: BlockId.create('uvx'),
          },
          path: SCREENS,
        },
      ],
      name: 'a domain names tools titled in lower case and by a phrase',
      path: SCREENS,
      text: chapterSaying('Screens', 'Every screen is built by uvx and Poe the Poet.'),
    },
    {
      expected: [
        {
          code: NamesCode.ProductOfNoBlock,
          details: {
            name: 'Docker',
          },
          path: UVX,
        },
      ],
      name: "an implementation's passport names a product no block holds",
      path: UVX,
      text: nestedPassportFile({
        body: '# uvx\n\n> Runs a tool in Docker.\n',
        id: 'uvx',
      }),
    },
  ])('should report each name when $name', ({ expected, path, text }) => {
    // Act
    const findings = checked({
      path,
      text,
    });

    // Assert
    expect(findings).toStrictEqual(expected);
  });

  it.each([
    {
      name: 'core names a product only in code',
      path: CODE,
      text: chapterSaying('Code', 'Every program sets `TypeScript` aside.'),
    },
    {
      name: 'an implementation names a language and a domain names a format',
      path: HOOKS,
      text: chapterSaying('Hooks', 'Every hook is TypeScript and reads JSON.'),
    },
    {
      name: 'a vendor opens a longer proper name',
      path: STORAGE,
      text: chapterSaying('Storage', 'Every tab is read in Chrome DevTools.'),
    },
    {
      name: "core's passport names a product",
      path: CORE,
      text: nestedPassportFile({
        body: '# Core\n\nRuns in Docker.\n',
        id: 'core',
      }),
    },
    {
      name: 'a language in the map and a domain are named by their titles',
      path: STORAGE,
      text: chapterSaying('Storage', 'Every tab of TS keeps its Presentation.'),
    },
    {
      name: 'a name runs on into a longer word',
      path: SCREENS,
      text: chapterSaying('Screens', 'Every screen is Reactive.'),
    },
    {
      name: 'a name follows a letter of a longer word',
      path: SCREENS,
      text: chapterSaying('Screens', 'Every screen holds a preReact hook.'),
    },
    {
      name: 'a title names a kind of tool',
      path: SCREENS,
      text: chapterSaying('Screens', 'Every screen is built by the Task runner.'),
    },
  ])('should report nothing when $name', ({ path, text }) => {
    // Act
    const findings = checked({
      path,
      text,
    });

    // Assert
    expect(findings).toStrictEqual([]);
  });
});
