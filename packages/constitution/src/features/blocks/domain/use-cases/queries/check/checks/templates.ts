import { COMMON_SCOPE, Layer, Placeholder, TEMPLATES_FOLDER } from '#/kernel/constants';
import type { Finding, Problem } from '#/kernel/types';
import { PresetFileKind, PresetPartPath, TemplatePath } from '#/kernel/value-objects';

import { BlockGraph } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';

enum TemplatesCode {
  StrayFile = 'stray-template-file',
  ToolWithoutTemplate = 'preset-tool-without-template',
  NamesNoBlock = 'template-names-no-block',
  ScopeNotCovered = 'template-scope-not-covered',
}

const templatesPrefix = `${TEMPLATES_FOLDER}/`;
const LAYOUT =
  'is not a fragment of a block: templates/project/<scope>/<block>/<path>, the scope common or a language';

const templateProblem = (input: {
  graph: CheckInput['graph'];
  path: string;
}): Problem | undefined => {
  const place = TemplatePath.parse(input.path);

  if (place === undefined) {
    return {
      code: TemplatesCode.StrayFile,
      message: LAYOUT,
    };
  }

  if (BlockGraph.named(input.graph, place.tool) === undefined) {
    return {
      code: TemplatesCode.NamesNoBlock,
      message: `is in ${templatesPrefix}${place.scope}/${place.tool}/, which names no block; a template is a fragment its block owns`,
    };
  }

  return place.scope === COMMON_SCOPE ||
    BlockGraph.named(input.graph, place.scope)?.layer === Layer.Language
    ? undefined
    : {
        code: TemplatesCode.ScopeNotCovered,
        message: `is in ${templatesPrefix}${place.scope}/, which is neither ${COMMON_SCOPE} nor a language`,
      };
};

const toolFindings = (input: CheckInput): readonly Finding[] => {
  const tools = new Set(
    input.constitution.presets.flatMap(({ path }) => {
      const preset = PresetPartPath.parse(path);

      return preset?.kind === PresetFileKind.Part
        ? [
            `${preset.scope}/${preset.tool}`,
          ]
        : [];
    }),
  );

  return [
    ...tools,
  ]
    .filter(
      (folder) =>
        !input.constitution.templates.some(({ path, text }) => {
          const place = TemplatePath.parse(path);

          return (
            place !== undefined &&
            `${place.scope}/${place.tool}` === folder &&
            text.includes(Placeholder.Parts)
          );
        }),
    )
    .map((folder) => ({
      code: TemplatesCode.ToolWithoutTemplate,
      message: `has parts and no template in ${templatesPrefix}${folder}/ that takes them by ${Placeholder.Parts}`,
      path: `presets/${folder}/`,
    }));
};

const templatesCheck: Check = (input: CheckInput): readonly Finding[] => [
  ...toolFindings(input),
  ...input.constitution.templates.flatMap(({ path }) => {
    const problem = templateProblem({
      graph: input.graph,
      path,
    });

    return problem === undefined
      ? []
      : [
          {
            ...problem,
            path,
          },
        ];
  }),
];

export { templatesCheck };
