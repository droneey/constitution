import type { ValueFindingDetails } from '#/kernel/entities';
import { ValueSite } from '#/kernel/entities';
import { ValueFailure } from '#/kernel/errors';
import type { TextsOf } from '#/shared/cli';

const blockIdText = (details: ValueFindingDetails[ValueFailure.BlockId]): string => {
  switch (details.site) {
    case ValueSite.FrontMatterId:
      return `front matter: id "${details.written}" is not a kebab-case block id`;
    case ValueSite.BlockFolder:
      return `is a block folder named "${details.written}", which is not a kebab-case block id`;
    case ValueSite.SeamFile:
      return "is a seam whose name is not a kebab-case block id; a seam is with/<block>.md, named after the other block's id";
    // Stryker disable next-line ConditionalExpression: no site reaches the default, which only the compiler reads
    default:
      return details satisfies never;
  }
};

const ruleSlugText = (details: ValueFindingDetails[ValueFailure.RuleSlug]): string => {
  switch (details.site) {
    case ValueSite.RuleHeading:
      return `rule "${details.written}" is not a kebab-case slug`;
    case ValueSite.TightenedRule:
      return `rule "${details.rule}" tightens "${details.written}", which is not a kebab-case slug`;
    // Stryker disable next-line ConditionalExpression: no site reaches the default, which only the compiler reads
    default:
      return details satisfies never;
  }
};

const valueTexts: TextsOf<ValueFindingDetails> = {
  [ValueFailure.BlockId]: blockIdText,
  [ValueFailure.Glob]: ({ written }) =>
    `front matter: governs lists ${JSON.stringify(written)}, whose braces do not pair or nest too deep`,
  [ValueFailure.RuleSlug]: ruleSlugText,
};

export { valueTexts };
