import { beforeAll, describe, expect, it } from 'bun:test';

import { createLintBatch } from './biome-preset.fixtures';

const { lintCases, lintFindings, lintRegistered } = createLintBatch();

const SLUG = 'case-pins-meaning-never-wording';
const LINT_TIMEOUT = 60_000;

// A spec whose one case asserts with the line given.
const specWith = (assertion: string): string =>
  `import { expect, test } from 'bun:test';\n\ntest('should check when it runs', () => {\n  // Arrange\n  const given = 1;\n\n  // Act\n  const outcome = String(given);\n\n  // Assert\n  ${assertion}\n});\n`;

const SPEC = 'src/__tests__/order.test.ts';

beforeAll(lintRegistered, LINT_TIMEOUT);

describe('the plugin case-pins-meaning-never-wording', () => {
  it.each(
    lintCases([
      {
        condition: 'toBe expects a sentence',
        files: {
          [SPEC]: specWith("expect(outcome).toBe('the order is not paid');"),
        },
      },
      {
        condition: 'toStrictEqual expects a template of prose',
        files: {
          [SPEC]: specWith('expect(outcome).toStrictEqual(`${given} is not paid yet`);'),
        },
      },
      {
        condition: 'toContain expects words in another script',
        files: {
          [SPEC]: specWith("expect(outcome).toContain('замовлення не оплачено');"),
        },
      },
      {
        condition: 'a negated toContain expects a sentence',
        files: {
          [SPEC]: specWith("expect(outcome).not.toContain('the order is paid');"),
        },
      },
      {
        condition: 'toMatch expects a pattern of prose',
        files: {
          [SPEC]: specWith('expect(outcome).toMatch(/is not paid yet/);'),
        },
      },
      {
        condition: 'toThrow expects a sentence',
        files: {
          [SPEC]: specWith("expect(() => outcome).toThrow('the order is not paid');"),
        },
      },
      {
        condition: 'a fixture of the end-to-end tests expects a sentence',
        files: {
          'tests/e2e/order.fixtures.ts':
            "import { expect } from 'bun:test';\n\nexport const expectUnpaid = (outcome: string): void => {\n  expect(outcome).toBe('the order is not paid');\n};\n",
        },
      },
    ]),
  )('should refuse the wording when $condition', ({ files, unit }) => {
    // Arrange
    const project = {
      files,
      unit,
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins).toContain(SLUG);
  });

  it.each(
    lintCases([
      {
        condition: 'the expected value is a code',
        files: {
          [SPEC]: specWith("expect(outcome).toBe('order-unpaid');"),
        },
      },
      {
        condition: 'the expected value is a path and a count',
        files: {
          [SPEC]: specWith("expect(outcome).toStrictEqual('src/orders/order.ts: 2');"),
        },
      },
      {
        condition: 'the expected value holds two words',
        files: {
          [SPEC]: specWith("expect(outcome).toBe('not paid');"),
        },
      },
      {
        condition: 'a template holds only the values it joins',
        files: {
          [SPEC]: specWith('expect(outcome).toBe(`${given} ${given} ${given}`);'),
        },
      },
      {
        condition: 'toThrow expects the class of the failure',
        files: {
          [SPEC]: specWith('expect(() => outcome).toThrow(RangeError);'),
        },
      },
      {
        condition: 'the expected text comes from a row of the one table of the format',
        files: {
          [SPEC]: `import { expect, test } from 'bun:test';\n\ntest.each([{ code: 'unpaid', text: 'the order is not paid' }])('should say $code', ({ code, text }) => {\n  // Arrange\n  const given = code;\n\n  // Act\n  const said = given;\n\n  // Assert\n  expect(said).toBe(text);\n});\n`,
        },
      },
      {
        condition: 'a row of a table holds a message the case reads as data',
        files: {
          [SPEC]: `import { expect, test } from 'bun:test';\n\ntest.each([{ message: 'the order is not paid' }])('should check when $message', (row) => {\n  // Arrange\n  const given = row;\n\n  // Act\n  const outcome = { ...given };\n\n  // Assert\n  expect(outcome).toStrictEqual(row);\n});\n`,
        },
      },
      {
        condition: 'the golden case of a format is marked',
        files: {
          [SPEC]: specWith(
            `// biome-ignore lint/plugin/${SLUG}: the one golden case of the format\n  expect(outcome).toBe('the order is not paid');`,
          ),
        },
      },
      {
        condition: 'a sentence is written outside the specs',
        files: {
          'src/orders/order.ts':
            "export const unpaid = (): { code: string; message: string } => ({\n  code: 'unpaid',\n  message: 'the order is not paid',\n});\n",
        },
      },
    ]),
  )('should accept the case when $condition', ({ files, unit }) => {
    // Arrange
    const project = {
      files,
      unit,
    };

    // Act
    const { plugins } = lintFindings(project);

    // Assert
    expect(plugins).not.toContain(SLUG);
  });
});
