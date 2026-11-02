import { z } from 'zod';

import { ConfigKey } from '#/kernel/constants';

import { OverrideField } from '../../../domain/project-config/entities';

const textModel = z
  .string()
  .min(1)
  .nullable()
  .transform((text) => text ?? undefined);

const itemsModel = z.array(z.string().min(1)).nullable();

const overrideModel = z.strictObject({
  [OverrideField.Level]: textModel.optional(),
  [OverrideField.Reason]: textModel.optional(),
  [OverrideField.Rule]: textModel.optional(),
  [OverrideField.Until]: textModel.optional(),
});

const configFileModel = z
  .looseObject({
    [ConfigKey.Axes]: itemsModel.optional(),
    [ConfigKey.Domains]: itemsModel.optional(),
    [ConfigKey.Implementations]: itemsModel.optional(),
    [ConfigKey.Languages]: itemsModel.optional(),
    [ConfigKey.Name]: textModel.optional(),
    [ConfigKey.Overrides]: z.array(overrideModel).nullable().optional(),
    [ConfigKey.Packs]: itemsModel.optional(),
    [ConfigKey.Platforms]: itemsModel.optional(),
  })
  .nullable();

type ConfigFileWire = NonNullable<z.infer<typeof configFileModel>>;

export type { ConfigFileWire };
export { configFileModel };
