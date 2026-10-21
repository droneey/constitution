import { matchesGlob } from 'node:path';

import { Layer } from '#/kernel/constants';
import type { Finding } from '#/kernel/types';

import type { Block } from '../../../../entities';
import type { BlocksById } from '../../../../utils';
import { closureOf } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';

enum ConfigurationLanguagesCode {
  NotRequired = 'configuration-language-not-required',
}

const blockFindings = (input: {
  block: Block;
  byId: BlocksById;
  languages: readonly Block[];
}): readonly Finding[] => {
  const reached = closureOf({
    blockId: input.block.id,
    byId: input.byId,
  });

  // A glob read as a path matches a language's pattern only when it ends in that language's extension.
  return input.block.frontMatter.governs.flatMap((glob) =>
    input.languages
      .filter(
        (language) =>
          language.id !== input.block.id &&
          !reached.has(language.id) &&
          language.frontMatter.governs.some((pattern) => matchesGlob(glob, pattern)),
      )
      .map((language) => ({
        code: ConfigurationLanguagesCode.NotRequired,
        message: `governs ${glob}, a file of ${language.id}, without requiring ${language.id} directly or through the blocks it requires or extends`,
        path: input.block.path,
      })),
  );
};

const configurationLanguagesCheck: Check = ({
  byId,
  constitution,
}: CheckInput): readonly Finding[] => {
  const languages = constitution.blocks.filter((block) => block.layer === Layer.Language);

  return constitution.blocks.flatMap((block) =>
    blockFindings({
      block,
      byId,
      languages,
    }),
  );
};

export { configurationLanguagesCheck };
