import { parseDocument } from 'yaml';

import type { BlockCard, BlockCardParser } from '../../domain/contracts';
import { EMPTY_CARD } from '../../domain/contracts';

const isMapping = (parsed: unknown): parsed is Record<string, unknown> =>
  typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);

const textOf = (field: unknown): string =>
  typeof field === 'string' || typeof field === 'number' || typeof field === 'boolean'
    ? String(field)
    : '';

const listOf = (field: unknown): readonly string[] => {
  if (Array.isArray(field)) {
    return field.map(textOf).filter((entry) => entry !== '');
  }

  const text = textOf(field);

  return text === ''
    ? []
    : [
        text,
      ];
};

// A project reads a card it can: a field left out, or of another form, is empty or absent, and a
// front matter that is no YAML mapping gives an empty card.
const card = (yaml: string): BlockCard => {
  const document = parseDocument(yaml);
  const parsed: unknown = document.errors.length === 0 ? document.toJS() : undefined;

  if (!isMapping(parsed)) {
    return EMPTY_CARD;
  }

  const base = textOf(parsed['extends']);
  const summary = textOf(parsed['summary']);

  return {
    ...(base === ''
      ? {}
      : {
          extends: base,
        }),
    governs: listOf(parsed['governs']),
    isAbstract: parsed['abstract'] === true || parsed['abstract'] === 'true',
    languages: listOf(parsed['languages']),
    requires: listOf(parsed['requires']),
    ...(summary === ''
      ? {}
      : {
          summary,
        }),
  };
};

const createYamlBlockCardParser = (): BlockCardParser => ({
  card,
});

export { createYamlBlockCardParser };
