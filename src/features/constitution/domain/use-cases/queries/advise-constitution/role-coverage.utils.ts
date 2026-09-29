import { LANGUAGE_FREE_ROLES, Layer, Level } from '#/kernel';

import type { Block, Constitution, Rule } from '../../../entities';
import type { BlocksById } from '../../../utils';
import { checkOf, ruleLanguagesOf } from '../../../utils';

const languageFree: readonly string[] = LANGUAGE_FREE_ROLES;

// A tool holds its checks for the languages it names; a tool that names none
// holds only the language-free roles, for every language.
const heldRoles = (input: {
  blocks: readonly Block[];
  language: string;
}): ReadonlySet<string> =>
  new Set(
    input.blocks.flatMap(({ frontMatter }) =>
      frontMatter.checks.filter((role) =>
        frontMatter.languages.length === 0
          ? languageFree.includes(role)
          : frontMatter.languages.includes(input.language),
      ),
    ),
  );

// A language needs only the roles its files are held to; an unknown role is
// the rules check's finding, not a tool to add.
const neededRoles = (input: {
  byId: BlocksById;
  language: Block;
  rules: readonly Rule[];
}): readonly string[] => {
  const roles: readonly string[] = input.language.frontMatter.roles;

  return [
    ...new Set(
      input.rules
        .filter((rule) => rule.level === Level.Must)
        .flatMap((rule) => {
          const check = checkOf(rule);
          const languages = ruleLanguagesOf({
            byId: input.byId,
            rule,
          });
          const applies =
            languages.length === 0 || languages.includes(input.language.id);

          // Stryker disable next-line ConditionalExpression: other checks have no role to match
          return check.kind === 'tool' && roles.includes(check.role) && applies
            ? [
                check.role,
              ]
            : [];
        }),
    ),
  ];
};

const roleCoverage = (input: {
  byId: BlocksById;
  constitution: Constitution;
}): readonly string[] =>
  input.constitution.blocks
    .filter((block) => block.layer === Layer.Language)
    .flatMap((language) => {
      const held = heldRoles({
        blocks: input.constitution.blocks,
        language: language.id,
      });
      const missing = neededRoles({
        byId: input.byId,
        language,
        rules: input.constitution.rules,
      }).filter((role) => !held.has(role));

      return missing.length === 0
        ? []
        : [
            `role coverage: ${language.id} has no tool for ${missing.join(', ')}`,
          ];
    });

export { roleCoverage };
