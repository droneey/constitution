import type { Finding } from '#/kernel';
import { AXES, Layer } from '#/kernel';

import type { Rule } from '../../../../entities';
import type { BlocksById, PresetPath } from '../../../../utils';
import { PresetFileKind, presetPathOf } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';

const SELF = 'self';
const COMMON = 'common';
const LAYOUT =
  'is not a part of a preset: presets/<scope>/<tool>/<axis>/<block>.<extension>, presets/<scope>/<tool>/<axis>/plugins/<rule>.grit, or presets/<scope>/<tool>/bindings.yaml';
const axes: readonly string[] = AXES;

type PartPath = Exclude<
  PresetPath,
  {
    kind: PresetFileKind.Bindings;
  }
>;

const nameMessage = (input: {
  isBlock: (id: string) => boolean;
  preset: PartPath;
  rules: ReadonlyMap<string, Rule>;
}): string | undefined => {
  const { name, axis } = input.preset;

  if (input.preset.kind === PresetFileKind.Part) {
    return name === SELF || input.isBlock(name)
      ? undefined
      : `is named "${name}", which is neither a block nor ${SELF}`;
  }

  const rule = input.rules.get(name);

  if (rule === undefined) {
    return `is named "${name}", which is not a rule; a plugin is named after the rule it holds`;
  }

  return rule.axis === axis
    ? undefined
    : `holds ${name}, a rule of ${rule.axis}, in ${axis}/plugins`;
};

// A scope is common to every language the tool reads, or one of them.
const scopeMessage = (input: { byId: BlocksById; preset: PresetPath }): string | undefined => {
  const { scope, tool } = input.preset;
  const covered = input.byId.get(tool)?.frontMatter.languages ?? [];
  const isCovered =
    input.byId.get(scope)?.layer === Layer.Language &&
    (covered.length === 0 || covered.includes(scope));

  return scope === COMMON || isCovered
    ? undefined
    : `is in presets/${scope}/, which is neither ${COMMON} nor a language ${tool} covers`;
};

const partMessages = (input: {
  byId: BlocksById;
  isBlock: (id: string) => boolean;
  preset: PartPath;
  rules: ReadonlyMap<string, Rule>;
}): readonly (string | undefined)[] => {
  const { axis } = input.preset;

  return [
    axes.includes(axis) ? undefined : `is in ${axis}/, which is not an axis: ${AXES.join(', ')}`,
    nameMessage(input),
  ];
};

const presetsCheck: Check = ({ byId, constitution }: CheckInput): readonly Finding[] => {
  const rules = new Map(
    constitution.rules.map((rule) => [
      rule.slug,
      rule,
    ]),
  );
  const isBlock = (id: string): boolean => byId.has(id);

  return constitution.presets.flatMap(({ path }) => {
    const preset = presetPathOf(path);

    if (preset === undefined) {
      return [
        {
          message: LAYOUT,
          path,
        },
      ];
    }

    return [
      isBlock(preset.tool)
        ? undefined
        : `is in presets/${preset.scope}/${preset.tool}/, which names no block`,
      scopeMessage({
        byId,
        preset,
      }),
      ...(preset.kind === PresetFileKind.Bindings
        ? []
        : partMessages({
            byId,
            isBlock,
            preset,
            rules,
          })),
    ].flatMap((message) =>
      message === undefined
        ? []
        : [
            {
              message,
              path,
            },
          ],
    );
  });
};

export { presetsCheck };
