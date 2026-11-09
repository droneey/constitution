import type { BlockModel, Lowering, ModelRule } from '#/kernel/entities';
import type { RuleSlug } from '#/kernel/value-objects';
import { UnitPath } from '#/kernel/value-objects';

import type { EntryText } from '../../../preset-entry/entities';
import { PresetEntry, TextPlace } from '../../../preset-entry/entities';
import { PLUGINS_FOLDER_NAME } from '../../../shared/constants';
import type { DiagnosticIndex, HeldRule } from '../../entities';

interface UnitFile {
  readonly entries: readonly PresetEntry[];
  readonly unitPath: UnitPath;
}

interface IndexDiagnosticsInput {
  readonly files: readonly UnitFile[];
  readonly lowerings: ReadonlyMap<RuleSlug, readonly Lowering[]>;
  readonly model: BlockModel;
}

const RULE_NAME = /^[a-z]\w*[A-Z]/;
const CODE_SELECTOR = /^[A-Z]+\d*$/;
const NAME_PARTS = /[^A-Za-z\d]/;
const pluginPath = new RegExp(`/${PLUGINS_FOLDER_NAME}/[^/]+/([^/.]+)\\.`);

const idsOf = (text: EntryText): readonly string[] => {
  const plugin = pluginPath.exec(text.text)?.[1];

  return plugin === undefined
    ? text.text.split(NAME_PARTS).filter((part) => RULE_NAME.test(part) || CODE_SELECTOR.test(part))
    : [
        `[${plugin}]`,
      ];
};

const idsOfEntry = (entry: PresetEntry): readonly string[] =>
  PresetEntry.textsOf(entry)
    .filter(
      (text) =>
        text.place === TextPlace.Key ||
        text.place === TextPlace.Item ||
        text.place === TextPlace.Copied,
    )
    .flatMap(idsOf);

const heldOf = (input: {
  lowerings: IndexDiagnosticsInput['lowerings'];
  rule: ModelRule;
  unitPath: UnitPath;
}): HeldRule => {
  const { rule } = input;
  const lowering = input.lowerings
    .get(rule.slug)
    ?.find((lowered) => UnitPath.equals(lowered.unit, input.unitPath));

  return {
    level: lowering?.level ?? rule.level,
    slug: rule.slug,
    statement: rule.statement,
    why: rule.why,
  };
};

const indexOf = (input: {
  entries: readonly PresetEntry[];
  lowerings: IndexDiagnosticsInput['lowerings'];
  rules: ReadonlyMap<string, ModelRule>;
  unitPath: UnitPath;
}): DiagnosticIndex => {
  const pairs = input.entries.flatMap((entry) => {
    const rule = input.rules.get(entry.rule);

    if (rule === undefined) {
      return [];
    }

    const held = heldOf({
      ...input,
      rule,
    });

    return idsOfEntry(entry).map((id) => ({
      held,
      id,
    }));
  });

  return new Map(
    [
      ...Map.groupBy(pairs, ({ id }) => id),
    ].map(([id, named]) => [
      id,
      named.map(({ held }) => held),
    ]),
  );
};

const indexDiagnostics = (input: IndexDiagnosticsInput): ReadonlyMap<UnitPath, DiagnosticIndex> => {
  const rules = new Map<string, ModelRule>(
    input.model.rules.map((rule) => [
      rule.slug,
      rule,
    ]),
  );

  return new Map(
    [
      ...Map.groupBy(input.files, (file) => file.unitPath),
    ].map(([unitPath, files]) => [
      unitPath,
      indexOf({
        entries: files.flatMap((file) => file.entries),
        lowerings: input.lowerings,
        rules,
        unitPath,
      }),
    ]),
  );
};

export type { IndexDiagnosticsInput };
export { indexDiagnostics };
