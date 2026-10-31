import { RuleSlug } from '#/kernel/value-objects';

const hotRuleSlugs: readonly RuleSlug[] = [
  'comment-explains-why',
  'published-declaration-documented-only-where-not-obvious',
  'name-never-an-empty-word',
  'expected-failure-documented-where-no-signature-names-it',
].map(RuleSlug.create);

export { hotRuleSlugs };
