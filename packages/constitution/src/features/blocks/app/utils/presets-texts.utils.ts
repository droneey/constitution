import {
  AXES,
  COMMON_SCOPE,
  Placeholder,
  PRESETS_FOLDER,
  SELF_PART,
  TEMPLATES_FOLDER,
} from '#/kernel/constants';
import type { TextsOf } from '#/shared/cli';

import type {
  BindingsDetails,
  PresetsDetails,
  TemplatesDetails,
} from '../../domain/use-cases/queries/check';
import { BindingsCode, PresetsCode, TemplatesCode } from '../../domain/use-cases/queries/check';
import { listOf } from './wording.utils';

const toolAxis = `${PRESETS_FOLDER}/<scope>/<tool>/<axis>`;
const axisNames = listOf({
  conjunction: 'or',
  names: AXES,
});
const presetLayout = `is not a part of a preset: ${toolAxis}/<block>.<extension>, ${toolAxis}/plugins/<rule>.grit, ${toolAxis}/bindings.yaml, the axis ${axisNames}, or a module the configurations of a scope share, ${PRESETS_FOLDER}/<scope>/<name>.<extension>`;
const templateLayout = `is not a fragment of a block: ${TEMPLATES_FOLDER}/<scope>/<block>/<path>, the scope ${COMMON_SCOPE} or a language`;

const presetTexts: TextsOf<PresetsDetails> = {
  [PresetsCode.StrayFile]: () => presetLayout,
  [PresetsCode.ToolNamesNoBlock]: ({ scope, tool }) =>
    `is in ${PRESETS_FOLDER}/${scope}/${tool}/, which names no block`,
  [PresetsCode.ScopeNotCovered]: ({ scope, tool }) =>
    `is in ${PRESETS_FOLDER}/${scope}/, which is neither ${COMMON_SCOPE} nor a language ${tool} covers`,
  [PresetsCode.PartNamesNoBlock]: ({ name }) =>
    `is named "${name}", which is neither a block nor ${SELF_PART}`,
  [PresetsCode.PluginNamesNoRule]: ({ rule }) =>
    `is named "${rule}", which is not a rule; a plugin is named after the rule it holds`,
  [PresetsCode.PluginOffAxis]: ({ axis, rule, ruleAxis }) =>
    `holds ${rule}, a rule of ${ruleAxis}, in ${axis}/plugins/`,
};

const bindingsTexts: TextsOf<BindingsDetails> = {
  [BindingsCode.NotRule]: ({ rule }) => `binds "${rule}", which is not a rule`,
  [BindingsCode.OffAxis]: ({ axis, rule, ruleAxis }) =>
    `binds ${rule}, a rule of ${ruleAxis}, under ${axis}`,
  [BindingsCode.OutOfReach]: ({ part, rule, ruleBlock }) =>
    `binds ${rule}, a rule of ${ruleBlock}, to the part ${part}, which may hold only rules of its block, of the blocks above it, of a seam with it or of its tool`,
  [BindingsCode.PartMissing]: ({ axis, part, rule, scope, tool }) =>
    `binds ${rule} to the part ${part}, which ${PRESETS_FOLDER}/${scope}/${tool}/${axis}/ does not hold`,
  [BindingsCode.SettingMissing]: ({ file, rule, setting }) =>
    `binds ${rule} to "${setting}", which ${file} does not hold`,
};

const templatesTexts: TextsOf<TemplatesDetails> = {
  [TemplatesCode.StrayFile]: () => templateLayout,
  [TemplatesCode.ToolWithoutTemplate]: ({ scope, tool }) =>
    `has parts and no template in ${TEMPLATES_FOLDER}/${scope}/${tool}/ that takes them by ${Placeholder.Parts}`,
  [TemplatesCode.NamesNoBlock]: ({ scope, tool }) =>
    `is in ${TEMPLATES_FOLDER}/${scope}/${tool}/, which names no block; a template is a fragment its block owns`,
  [TemplatesCode.ScopeNotCovered]: ({ scope }) =>
    `is in ${TEMPLATES_FOLDER}/${scope}/, which is neither ${COMMON_SCOPE} nor a language`,
};

const presetsTexts: TextsOf<BindingsDetails & PresetsDetails & TemplatesDetails> = {
  ...bindingsTexts,
  ...presetTexts,
  ...templatesTexts,
};

export { presetsTexts };
