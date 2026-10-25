import { COMMON_SCOPE, Placeholder, SELF_PART, TEMPLATES_FOLDER } from '#/kernel/constants';
import type { TextsOf } from '#/shared/cli';

import type {
  BindingsDetails,
  PluginDetails,
  PresetsDetails,
  TemplatesDetails,
} from '../../domain/use-cases/queries/check';
import {
  BindingsCode,
  PluginCode,
  PresetsCode,
  TemplatesCode,
} from '../../domain/use-cases/queries/check';

const PRESET_LAYOUT =
  'is not a part of a preset: presets/<scope>/<tool>/<axis>/<block>.<extension>, presets/<scope>/<tool>/<axis>/plugins/<rule>.grit, presets/<scope>/<tool>/<axis>/bindings.yaml, the axis foundation, architecture or workflow, or a module the configurations of a scope share, presets/<scope>/<name>.<extension>';
const TEMPLATE_LAYOUT =
  'is not a fragment of a block: templates/project/<scope>/<block>/<path>, the scope common or a language';
const ROOT_FIELD = '<root>';

const missingText = (role: string): string =>
  `is missing; the Constitution ships as a plugin and needs its ${role}`;

const pluginTexts: TextsOf<PluginDetails> = {
  [PluginCode.ManifestMissing]: () => missingText('manifest'),
  [PluginCode.MarketplaceMissing]: () => missingText('marketplace'),
  [PluginCode.NotJson]: ({ reason }) => `is not valid JSON: ${reason}`,
  [PluginCode.OffSchema]: ({ field, reason }) =>
    `does not match its schema: ${field === '' ? ROOT_FIELD : field}: ${reason}`,
  [PluginCode.SkillsDirectoryEmpty]: ({ directory }) =>
    `lists the skills directory "./${directory}", which holds no <skill>/SKILL.md`,
  [PluginCode.SkillsDirectoryUnlisted]: ({ directory }) =>
    `does not list "./${directory}", which holds skills`,
  [PluginCode.SkillWithoutFile]: () => 'holds no SKILL.md; a skill is a folder with SKILL.md in it',
  [PluginCode.SkillWithoutFrontMatter]: () =>
    'has no front matter; a skill names itself and says when to use it there',
  [PluginCode.SkillFrontMatterNotYaml]: ({ reason }) => `front matter is not valid YAML: ${reason}`,
  [PluginCode.SkillFieldMissing]: ({ field }) =>
    `front matter lacks "${field}"; a skill declares its name and description`,
  [PluginCode.AgentWithoutFrontMatter]: () =>
    'has no front matter; an agent names itself and says when to use it there',
  [PluginCode.AgentFrontMatterNotYaml]: ({ reason }) => `front matter is not valid YAML: ${reason}`,
  [PluginCode.AgentFieldMissing]: ({ field }) =>
    `front matter lacks "${field}"; an agent declares its name and description`,
  [PluginCode.AgentNameMismatch]: ({ file, name }) =>
    `is named "${name}" in its front matter; an agent is named after its file, ${file}`,
  [PluginCode.TemplateMissing]: () => 'is missing; /ratify writes a project from the templates',
  [PluginCode.MarketplaceOmitsPlugin]: ({ plugin, repo }) =>
    `does not list the plugin "${plugin ?? ''}" from the GitHub repository its manifest names (${repo ?? 'none'}), at a release tag v<major>.<minor>.<patch> and from the folder that holds its manifest`,
  [PluginCode.HookFileMissing]: ({ file }) => `runs "${file}", which is missing`,
};

const presetTexts: TextsOf<PresetsDetails> = {
  [PresetsCode.StrayFile]: () => PRESET_LAYOUT,
  [PresetsCode.ToolNamesNoBlock]: ({ scope, tool }) =>
    `is in presets/${scope}/${tool}/, which names no block`,
  [PresetsCode.ScopeNotCovered]: ({ scope, tool }) =>
    `is in presets/${scope}/, which is neither ${COMMON_SCOPE} nor a language ${tool} covers`,
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
    `binds ${rule} to the part ${part}, which presets/${scope}/${tool}/${axis}/ does not hold`,
  [BindingsCode.SettingMissing]: ({ file, rule, setting }) =>
    `binds ${rule} to "${setting}", which ${file} does not hold`,
};

const templatesTexts: TextsOf<TemplatesDetails> = {
  [TemplatesCode.StrayFile]: () => TEMPLATE_LAYOUT,
  [TemplatesCode.ToolWithoutTemplate]: ({ scope, tool }) =>
    `has parts and no template in ${TEMPLATES_FOLDER}/${scope}/${tool}/ that takes them by ${Placeholder.Parts}`,
  [TemplatesCode.NamesNoBlock]: ({ scope, tool }) =>
    `is in ${TEMPLATES_FOLDER}/${scope}/${tool}/, which names no block; a template is a fragment its block owns`,
  [TemplatesCode.ScopeNotCovered]: ({ scope }) =>
    `is in ${TEMPLATES_FOLDER}/${scope}/, which is neither ${COMMON_SCOPE} nor a language`,
};

const presetsTexts: TextsOf<BindingsDetails & PluginDetails & PresetsDetails & TemplatesDetails> = {
  ...bindingsTexts,
  ...pluginTexts,
  ...presetTexts,
  ...templatesTexts,
};

export { presetsTexts };
