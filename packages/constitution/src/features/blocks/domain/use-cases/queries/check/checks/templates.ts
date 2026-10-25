import { COMMON_SCOPE, Layer, Placeholder, PRESETS_FOLDER } from '#/kernel/constants';
import type { FindingOf, ProblemOf } from '#/kernel/types';
import { PresetFileKind, PresetPartPath, TemplatePath } from '#/kernel/value-objects';

import { BlockGraph } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';

enum TemplatesCode {
  StrayFile = 'stray-template-file',
  ToolWithoutTemplate = 'preset-tool-without-template',
  NamesNoBlock = 'template-names-no-block',
  ScopeNotCovered = 'template-scope-not-covered',
}

interface TemplatesDetails {
  readonly [TemplatesCode.StrayFile]: object;
  readonly [TemplatesCode.ToolWithoutTemplate]: {
    readonly scope: string;
    readonly tool: string;
  };
  readonly [TemplatesCode.NamesNoBlock]: {
    readonly scope: string;
    readonly tool: string;
  };
  readonly [TemplatesCode.ScopeNotCovered]: {
    readonly scope: string;
  };
}

type TemplatesFinding = FindingOf<TemplatesDetails>;

type TemplatesProblem = ProblemOf<TemplatesDetails>;

const templateProblem = (input: {
  graph: CheckInput['graph'];
  path: string;
}): TemplatesProblem | undefined => {
  const place = TemplatePath.parse(input.path);

  if (place === undefined) {
    return {
      code: TemplatesCode.StrayFile,
      details: {},
    };
  }

  if (BlockGraph.named(input.graph, place.tool) === undefined) {
    return {
      code: TemplatesCode.NamesNoBlock,
      details: {
        scope: place.scope,
        tool: place.tool,
      },
    };
  }

  return place.scope === COMMON_SCOPE ||
    BlockGraph.named(input.graph, place.scope)?.layer === Layer.Language
    ? undefined
    : {
        code: TemplatesCode.ScopeNotCovered,
        details: {
          scope: place.scope,
        },
      };
};

const folderOf = (place: { scope: string; tool: string }): string => `${place.scope}/${place.tool}`;

const toolFindings = (input: CheckInput): readonly TemplatesFinding[] => {
  const parts = input.constitution.presets.flatMap(({ path }) => {
    const preset = PresetPartPath.parse(path);

    return preset?.kind === PresetFileKind.Part
      ? [
          preset,
        ]
      : [];
  });
  const tools = new Map(
    parts.map(
      (
        part,
      ): readonly [
        string,
        PresetPartPath,
      ] => [
        folderOf(part),
        part,
      ],
    ),
  );

  return [
    ...tools,
  ]
    .filter(
      ([folder]) =>
        !input.constitution.templates.some(({ path, text }) => {
          const place = TemplatePath.parse(path);

          return (
            place !== undefined && folderOf(place) === folder && text.includes(Placeholder.Parts)
          );
        }),
    )
    .map(
      ([folder, part]): TemplatesFinding => ({
        code: TemplatesCode.ToolWithoutTemplate,
        details: {
          scope: part.scope,
          tool: part.tool,
        },
        path: `${PRESETS_FOLDER}/${folder}/`,
      }),
    );
};

const templatesCheck: Check<TemplatesFinding> = (
  input: CheckInput,
): readonly TemplatesFinding[] => [
  ...toolFindings(input),
  ...input.constitution.templates.flatMap(({ path }): readonly TemplatesFinding[] => {
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

export type { TemplatesDetails };
export { TemplatesCode, templatesCheck };
