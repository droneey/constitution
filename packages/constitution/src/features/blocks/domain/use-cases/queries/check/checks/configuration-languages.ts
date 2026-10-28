import { Layer } from '#/kernel/constants';
import type { FindingOf } from '#/kernel/types';
import type { BlockId } from '#/kernel/value-objects';
import { Glob } from '#/kernel/value-objects';

import { Block, BlockGraph } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';

enum ConfigurationLanguagesCode {
  NotRequired = 'configuration-language-not-required',
}

interface ConfigurationLanguagesDetails {
  readonly [ConfigurationLanguagesCode.NotRequired]: {
    readonly glob: Glob;
    readonly language: BlockId;
  };
}

type ConfigurationLanguagesFinding = FindingOf<ConfigurationLanguagesDetails>;

const blockFindings = (input: {
  block: Block;
  graph: BlockGraph;
  languages: readonly Block[];
}): readonly ConfigurationLanguagesFinding[] => {
  const reached = BlockGraph.closureOf(input.graph, input.block.id);

  return input.block.frontMatter.governs.flatMap((glob) =>
    input.languages
      .filter(
        (language) =>
          !(Block.sameAs(language, input.block) || reached.has(language.id)) &&
          Glob.matchesAny({
            globs: language.frontMatter.governs,
            path: glob,
          }),
      )
      .map((language) => ({
        code: ConfigurationLanguagesCode.NotRequired,
        details: {
          glob,
          language: language.id,
        },
        path: input.block.passport.path,
      })),
  );
};

const configurationLanguagesCheck: Check<ConfigurationLanguagesFinding> = ({
  graph,
  constitution,
}: CheckInput): readonly ConfigurationLanguagesFinding[] => {
  const languages = constitution.blocks.filter((block) => block.layer === Layer.Language);

  return constitution.blocks.flatMap((block) =>
    blockFindings({
      block,
      graph,
      languages,
    }),
  );
};

export type { ConfigurationLanguagesDetails };
export { ConfigurationLanguagesCode, configurationLanguagesCheck };
