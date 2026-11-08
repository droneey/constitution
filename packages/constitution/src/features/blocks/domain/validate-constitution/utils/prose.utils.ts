import {
  collapseWhitespace,
  isHeading,
  withoutCodeFences,
  withoutInlineCode,
} from '#/kernel/utils';

const TERM_ID = /\{#[^}\n]*\}/g;
const BLOCK_PATH = /\b[a-z][a-z-]*(?:\/[a-z][a-z-]*)+\b/g;

const proseOf = (text: string): string =>
  collapseWhitespace(
    withoutInlineCode(withoutCodeFences(text))
      .split('\n')
      .filter((line) => !isHeading(line))
      .join('\n')
      .replaceAll(TERM_ID, ' ')
      .replaceAll(BLOCK_PATH, ' '),
  );

export { proseOf };
