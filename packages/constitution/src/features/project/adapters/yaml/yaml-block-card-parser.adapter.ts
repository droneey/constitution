import { parseDocument } from 'yaml';

import type { BlockCard, BlockCardParser } from '../../domain/contracts';

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

const EMPTY_CARD: BlockCard = {
  extends: undefined,
  governs: [],
  isAbstract: false,
  requires: [],
  summary: '',
} as const;

// A project reads a card it can: a field left out, or of another form, is empty, and a front
// matter that is no YAML mapping gives an empty card.
const card = (yaml: string): BlockCard => {
  const document = parseDocument(yaml);
  const parsed: unknown = document.errors.length === 0 ? document.toJS() : undefined;

  if (!isMapping(parsed)) {
    return EMPTY_CARD;
  }

  const base = textOf(parsed['extends']);

  return {
    extends: base === '' ? undefined : base,
    governs: listOf(parsed['governs']),
    isAbstract: parsed['abstract'] === true || parsed['abstract'] === 'true',
    requires: listOf(parsed['requires']),
    summary: textOf(parsed['summary']),
  };
};

const createYamlBlockCardParser = (): BlockCardParser => ({
  card,
});

export { createYamlBlockCardParser };
