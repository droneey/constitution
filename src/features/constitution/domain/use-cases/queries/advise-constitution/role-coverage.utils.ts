import { LANGUAGE_FREE_ROLES, ROLES } from '#/kernel';

import type { Block, Constitution, Rule } from '../../../entities';
import type { BlocksById } from '../../../utils';
import { checkOf, languagesOf, ruleLanguagesOf } from '../../../utils';

const roles: readonly string[] = ROLES;
const languageFree: readonly string[] = LANGUAGE_FREE_ROLES;

// A block's checks hold for its languages; a block with no language checks
// only the language-free roles.
const heldRoles = (input: {
  blocks: readonly Block[];
  byId: BlocksById;
  language: string;
}): ReadonlySet<string> =>
  new Set(
    input.blocks.flatMap((block) => {
      const languages = languagesOf({
        blockId: block.id,
        byId: input.byId,
      });

      return block.frontMatter.checks.filter((role) =>
        languages.length === 0
          ? languageFree.includes(role)
          : languages.includes(input.language),
      );
    }),
  );

// An unknown role is the rules check's finding, not a tool to add.
const neededRoles = (input: {
  byId: BlocksById;
  language: string;
  rules: readonly Rule[];
}): readonly string[] => [
  ...new Set(
    input.rules
      .filter((rule) => rule.level === 'MUST')
      .flatMap((rule) => {
        const check = checkOf(rule);
        const languages = ruleLanguagesOf({
          byId: input.byId,
          rule,
        });
        const applies =
          languages.length === 0 || languages.includes(input.language);

        // Stryker disable next-line ConditionalExpression: other checks have no role to match
        return check.kind === 'tool' && roles.includes(check.role) && applies
          ? [
              check.role,
            ]
          : [];
      }),
  ),
];

const roleCoverage = (input: {
  byId: BlocksById;
  constitution: Constitution;
}): readonly string[] =>
  input.constitution.blocks
    .filter((block) => block.layer === 'language')
    .flatMap((language) => {
      const held = heldRoles({
        blocks: input.constitution.blocks,
        byId: input.byId,
        language: language.id,
      });
      const missing = neededRoles({
        byId: input.byId,
        language: language.id,
        rules: input.constitution.rules,
      }).filter((role) => !held.has(role));

      return missing.length === 0
        ? []
        : [
            `role coverage: ${language.id} has no tool for ${missing.join(', ')}`,
          ];
    });

export { roleCoverage };
