import { reservedWords } from '#/kernel/constants';
import type { ValueFindingDetails } from '#/kernel/entities';
import { ValueSite } from '#/kernel/entities';
import { ValueFailure } from '#/kernel/errors';
import type { TextsOf } from '#/shared/cli';

const reserved = [
  ...reservedWords,
];

const blockIdShape = `kebab-case segments joined by "/", none of them ${reserved.slice(0, -1).join(', ')} or ${reserved.at(-1)}`;

const blockIdText = (details: ValueFindingDetails[ValueFailure.BlockId]): string => {
  switch (details.site) {
    case ValueSite.FrontMatterId:
      return `front matter: id "${details.written}" is no block id: ${blockIdShape}`;
    case ValueSite.BlockFolder:
      return `is a block folder named "${details.written}", which is no block id: ${blockIdShape}`;
    case ValueSite.SeamFile:
      return `is a seam whose name is no block id (${blockIdShape}); a seam is with/<block>.md, named after the other block's id`;
  }
};

const ruleSlugText = (details: ValueFindingDetails[ValueFailure.RuleSlug]): string => {
  switch (details.site) {
    case ValueSite.RuleHeading:
      return `rule "${details.written}" is not a kebab-case slug`;
    case ValueSite.TightenedRule:
      return `rule "${details.rule}" tightens "${details.written}", which is not a kebab-case slug`;
  }
};

const valueTexts: TextsOf<ValueFindingDetails> = {
  [ValueFailure.BlockId]: blockIdText,
  [ValueFailure.Glob]: ({ written }) =>
    `front matter: governs lists ${JSON.stringify(written)}, whose braces do not pair or nest too deep`,
  [ValueFailure.RuleSlug]: ruleSlugText,
};

export { valueTexts };
