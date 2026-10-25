import { Layer } from '#/kernel/constants';
import type { Finding } from '#/kernel/types';
import { isGoverned } from '#/kernel/utils';

import { Block, BlockGraph } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';

enum ConfigurationLanguagesCode {
  NotRequired = 'configuration-language-not-required',
}

const blockFindings = (input: {
  block: Block;
  graph: BlockGraph;
  languages: readonly Block[];
}): readonly Finding[] => {
  const reached = BlockGraph.closureOf(input.graph, input.block.id);

  // A glob read as a path matches a language's pattern only when it ends in that language's extension.
  return input.block.frontMatter.governs.flatMap((glob) =>
    input.languages
      .filter(
        (language) =>
          !(Block.sameAs(language, input.block) || reached.has(language.id)) &&
          isGoverned({
            globs: language.frontMatter.governs,
            path: glob,
          }),
      )
      .map((language) => ({
        code: ConfigurationLanguagesCode.NotRequired,
        message: `governs ${glob}, a file of ${language.id}, without requiring ${language.id} directly or through the blocks it requires or extends`,
        path: input.block.passport.path,
      })),
  );
};

const configurationLanguagesCheck: Check = ({
  graph,
  constitution,
}: CheckInput): readonly Finding[] => {
  const languages = constitution.blocks.filter((block) => block.layer === Layer.Language);

  return constitution.blocks.flatMap((block) =>
    blockFindings({
      block,
      graph,
      languages,
    }),
  );
};

export { configurationLanguagesCheck };
