import type { TextsOf } from '#/shared/cli';

import { RELATIVE_PREFIX, SKILL_FILE } from '../../domain/constants';
import type { PluginDetails } from '../../domain/use-cases/queries/check';
import { PluginCode } from '../../domain/use-cases/queries/check';
import { fieldOf } from './wording.utils';

const missingText = (role: string): string =>
  `is missing; the Constitution ships as a plugin and needs its ${role}`;

const pluginTexts: TextsOf<PluginDetails> = {
  [PluginCode.ManifestMissing]: () => missingText('manifest'),
  [PluginCode.MarketplaceMissing]: () => missingText('marketplace'),
  [PluginCode.NotJson]: ({ reason }) => `is not valid JSON: ${reason}`,
  [PluginCode.OffSchema]: ({ field, reason }) =>
    `does not match its schema: ${fieldOf(field)}: ${reason}`,
  [PluginCode.SkillsDirectoryEmpty]: ({ directory }) =>
    `lists the skills directory "${RELATIVE_PREFIX}${directory}", which holds no <skill>/${SKILL_FILE}`,
  [PluginCode.SkillsDirectoryUnlisted]: ({ directory }) =>
    `does not list "${RELATIVE_PREFIX}${directory}", which holds skills`,
  [PluginCode.SkillWithoutFile]: () =>
    `holds no ${SKILL_FILE}; a skill is a folder with ${SKILL_FILE} in it`,
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

export { pluginTexts };
