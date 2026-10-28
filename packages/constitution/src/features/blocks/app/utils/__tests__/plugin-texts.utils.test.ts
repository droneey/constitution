import { describe, expect, it } from 'bun:test';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import type { ProblemOf } from '#/kernel/types';
import { textOf } from '#/shared/cli';

import { SkillField } from '../../../domain/entities';
import type {
  HooksDetails,
  ManifestReadDetails,
  MarketplaceDetails,
  PluginDetails,
} from '../../../domain/use-cases/queries/check';
import {
  HooksCode,
  ManifestReadCode,
  MarketplaceCode,
  PluginCode,
} from '../../../domain/use-cases/queries/check';
import { pluginTexts } from '../plugin-texts.utils';

const problems: Readonly<
  Record<string, ProblemOf<HooksDetails & ManifestReadDetails & MarketplaceDetails & PluginDetails>>
> = {
  [PluginCode.ManifestMissing]: {
    code: PluginCode.ManifestMissing,
    details: {},
  },
  [MarketplaceCode.Missing]: {
    code: MarketplaceCode.Missing,
    details: {},
  },
  [ManifestReadCode.NotJson]: {
    code: ManifestReadCode.NotJson,
    details: {
      reason: 'the reason',
    },
  },
  [`${ManifestReadCode.OffSchema} (the whole file)`]: {
    code: ManifestReadCode.OffSchema,
    details: {
      field: '',
      reason: 'the reason',
    },
  },
  [ManifestReadCode.OffSchema]: {
    code: ManifestReadCode.OffSchema,
    details: {
      field: 'plugins',
      reason: 'the reason',
    },
  },
  [PluginCode.SkillsDirectoryEmpty]: {
    code: PluginCode.SkillsDirectoryEmpty,
    details: {
      directory: 'skills/',
    },
  },
  [PluginCode.SkillsDirectoryUnlisted]: {
    code: PluginCode.SkillsDirectoryUnlisted,
    details: {
      directory: 'tools/skills/',
    },
  },
  [PluginCode.SkillWithoutFile]: {
    code: PluginCode.SkillWithoutFile,
    details: {},
  },
  [PluginCode.SkillWithoutFrontMatter]: {
    code: PluginCode.SkillWithoutFrontMatter,
    details: {},
  },
  [PluginCode.SkillFrontMatterNotYaml]: {
    code: PluginCode.SkillFrontMatterNotYaml,
    details: {
      reason: 'the reason',
    },
  },
  [PluginCode.SkillFieldMissing]: {
    code: PluginCode.SkillFieldMissing,
    details: {
      field: SkillField.Name,
    },
  },
  [PluginCode.AgentWithoutFrontMatter]: {
    code: PluginCode.AgentWithoutFrontMatter,
    details: {},
  },
  [PluginCode.AgentFrontMatterNotYaml]: {
    code: PluginCode.AgentFrontMatterNotYaml,
    details: {
      reason: 'the reason',
    },
  },
  [PluginCode.AgentFieldMissing]: {
    code: PluginCode.AgentFieldMissing,
    details: {
      field: SkillField.Description,
    },
  },
  [PluginCode.AgentNameMismatch]: {
    code: PluginCode.AgentNameMismatch,
    details: {
      file: 'reviewer',
      name: 'critic',
    },
  },
  [PluginCode.TemplateMissing]: {
    code: PluginCode.TemplateMissing,
    details: {},
  },
  [MarketplaceCode.OmitsPlugin]: {
    code: MarketplaceCode.OmitsPlugin,
    details: {
      plugin: 'constitution',
      repo: 'droneey/constitution',
    },
  },
  [`${MarketplaceCode.OmitsPlugin} (nothing named)`]: {
    code: MarketplaceCode.OmitsPlugin,
    details: {},
  },
  [HooksCode.FileMissing]: {
    code: HooksCode.FileMissing,
    details: {
      file: 'hooks/session-start.sh',
    },
  },
};

describe('pluginTexts', () => {
  it('should word a problem of each code as the golden file shows it', async () => {
    // Act
    const golden = goldenOf(
      Object.fromEntries(
        Object.entries(problems).map(([name, problem]) => [
          name,
          textOf(pluginTexts, problem.code, problem.details),
        ]),
      ),
    );

    // Assert
    expect(golden).toBe(
      await goldenFileText(new URL('plugin-texts.golden.txt', import.meta.url), golden),
    );
  });
});
