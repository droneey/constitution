import { Layer } from '#/kernel/constants';
import type { Finding, Problem } from '#/kernel/types';

import { PresetFileKind, presetPathOf } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';

enum TemplatesCode {
  StrayFile = 'stray-template-file',
  ToolWithoutTemplate = 'preset-tool-without-template',
  NamesNoBlock = 'template-names-no-block',
  ScopeNotCovered = 'template-scope-not-covered',
}

const TEMPLATES = 'templates/project/';
const COMMON = 'common';
const PARTS = '<parts>';
const PLACED_SEGMENTS = 3;
const LAYOUT =
  'is not a fragment of a block: templates/project/<scope>/<block>/<path>, the scope common or a language';

// templates/project/<scope>/<block>/<path>
const placeOf = (
  path: string,
):
  | {
      block: string;
      folder: string;
      scope: string;
    }
  | undefined => {
  const segments = path.slice(TEMPLATES.length).split('/');
  // Stryker disable next-line StringLiteral: the length check guards every read
  const [scope = '', block = ''] = segments;

  return segments.length < PLACED_SEGMENTS
    ? undefined
    : {
        block,
        folder: `${TEMPLATES}${scope}/`,
        scope,
      };
};

const templateProblem = (input: {
  byId: CheckInput['byId'];
  path: string;
}): Problem | undefined => {
  const place = placeOf(input.path);

  if (place === undefined) {
    return {
      code: TemplatesCode.StrayFile,
      message: LAYOUT,
    };
  }

  if (!input.byId.has(place.block)) {
    return {
      code: TemplatesCode.NamesNoBlock,
      message: `is in ${place.folder}${place.block}/, which names no block; a template is a fragment its block owns`,
    };
  }

  return place.scope === COMMON || input.byId.get(place.scope)?.layer === Layer.Language
    ? undefined
    : {
        code: TemplatesCode.ScopeNotCovered,
        message: `is in ${place.folder}, which is neither ${COMMON} nor a language`,
      };
};

const toolFindings = (input: CheckInput): readonly Finding[] => {
  const tools = new Set(
    input.constitution.presets.flatMap(({ path }) => {
      const preset = presetPathOf(path);

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
          const place = placeOf(path);

          return (
            place !== undefined &&
            `${place.scope}/${place.block}` === folder &&
            text.includes(PARTS)
          );
        }),
    )
    .map((folder) => ({
      code: TemplatesCode.ToolWithoutTemplate,
      message: `has parts and no template in ${TEMPLATES}${folder}/ that takes them by ${PARTS}`,
      path: `presets/${folder}/`,
    }));
};

const templatesCheck: Check = (input: CheckInput): readonly Finding[] => [
  ...toolFindings(input),
  ...input.constitution.templates.flatMap(({ path }) => {
    const problem = templateProblem({
      byId: input.byId,
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
