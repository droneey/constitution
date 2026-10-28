import { StepStatus, Tone } from '@droneey/design-cli';

import { EXECUTABLE_NAME } from '#/kernel/constants';
import { OLDEST_FORMAT } from '#/kernel/entities';
import { Version } from '#/kernel/value-objects';
import type { Section, TaskOutcome } from '#/shared/cli';
import { countOf, LIST_SEPARATOR, NO_PROJECT, noteSection, stepsSection } from '#/shared/cli';

import { Diagnosis, Health, InstallationPart, PartDiagnosis } from '../../domain/entities';
import {
  latestRefusedMessage,
  latestUnansweredMessage,
  latestUnreadableMessage,
  manifestFieldsMessage,
  manifestNotObjectMessage,
} from './report.messages';

const MISE_INSTALL = 'run mise install';
const RAISE_PIN = 'raise the Constitution pin in mise.toml, then run mise install';
const UPDATE_PLUGIN =
  'run claude plugin marketplace update droneey, then claude plugin update constitution@droneey';

const LABELS = {
  [InstallationPart.Executable]: 'Executable',
  [InstallationPart.Plugin]: 'Claude Code plugin',
  [InstallationPart.Release]: 'Latest release',
  [InstallationPart.Path]: 'constitution on PATH',
  [InstallationPart.Link]: 'Release link',
  [InstallationPart.Hooks]: 'Git hooks',
} as const satisfies Readonly<Record<InstallationPart, string>>;

const STATUSES = {
  [Health.Sound]: StepStatus.Done,
  [Health.Warned]: StepStatus.Warned,
  [Health.Broken]: StepStatus.Failed,
  [Health.Skipped]: StepStatus.Skipped,
} as const satisfies Readonly<Record<Health, StepStatus>>;

interface Said {
  readonly hint?: string;
  readonly summary: string;
}

const pinnedHint = `${MISE_INSTALL}, so PATH serves the release the project pins`;

const sayings: {
  readonly [TKind in Diagnosis]: (diagnosis: PartDiagnosis<TKind>) => Said;
} = {
  [Diagnosis.ExecutableRuns]: ({ executable }) => ({
    summary: `${EXECUTABLE_NAME} ${executable}`,
  }),
  [Diagnosis.PluginMissing]: () => ({
    hint: 'run claude plugin marketplace add droneey/constitution, then claude plugin install constitution@droneey',
    summary: 'the Claude Code plugin is not installed',
  }),
  [Diagnosis.PluginMatches]: ({ executable, plugin }) => ({
    summary: Version.equals(plugin, executable)
      ? plugin
      : `${plugin}, whose files are those of this executable ${executable}`,
  }),
  [Diagnosis.PluginDiffersAtItsVersion]: ({ executable }) => ({
    hint: 'install the plugin from the tree constitution runs from, whose plugin files changed since that release',
    summary: `the plugin's files differ from constitution's, both ${executable}`,
  }),
  [Diagnosis.PluginOlder]: ({ executable, plugin }) => ({
    hint: UPDATE_PLUGIN,
    summary: `the plugin ${plugin} is older than this executable ${executable}, and its files differ`,
  }),
  [Diagnosis.PluginNewer]: ({ executable, plugin }) => ({
    hint: RAISE_PIN,
    summary: `the plugin ${plugin} is newer than this executable ${executable}, and its files differ`,
  }),
  [Diagnosis.LatestUnanswered]: ({ reason }) => ({
    summary: latestUnansweredMessage(reason),
  }),
  [Diagnosis.LatestRefused]: ({ status }) => ({
    summary: latestRefusedMessage(String(status)),
  }),
  [Diagnosis.LatestUnreadable]: () => ({
    summary: latestUnreadableMessage(),
  }),
  [Diagnosis.LatestAhead]: ({ executable, latest }) => ({
    hint: RAISE_PIN,
    summary: `${latest} is out; this executable is ${executable}`,
  }),
  [Diagnosis.LatestHeld]: ({ latest }) => ({
    summary: `${latest} is the latest`,
  }),
  [Diagnosis.ExecutableNotOnPath]: () => ({
    hint: 'pin github:droneey/constitution in mise.toml as the README shows, then run mise install',
    summary: `${EXECUTABLE_NAME} is not on PATH, so the hooks cannot run`,
  }),
  [Diagnosis.PathMatches]: ({ path }) => ({
    summary: path,
  }),
  [Diagnosis.PathSilent]: ({ path }) => ({
    hint: pinnedHint,
    summary: `${path} does not answer --version`,
  }),
  [Diagnosis.PathDiffers]: ({ answered, executable, path }) => ({
    hint: pinnedHint,
    summary: `${path} is ${answered}, this executable ${executable}`,
  }),
  [Diagnosis.LinkWithoutProject]: () => ({
    summary: NO_PROJECT,
  }),
  [Diagnosis.ManifestUnreadable]: ({ manifest }) => ({
    hint: MISE_INSTALL,
    summary: `cannot read ${manifest}`,
  }),
  [Diagnosis.ManifestNotObject]: ({ manifest }) => ({
    hint: MISE_INSTALL,
    summary: manifestNotObjectMessage(manifest),
  }),
  [Diagnosis.ManifestMalformed]: ({ fields, manifest }) => ({
    hint: MISE_INSTALL,
    summary: manifestFieldsMessage({
      fields: fields.join(LIST_SEPARATOR),
      manifest,
    }),
  }),
  [Diagnosis.ManifestWithoutVersion]: ({ manifest }) => ({
    hint: MISE_INSTALL,
    summary: `${manifest} names no version`,
  }),
  [Diagnosis.ReleaseMissing]: ({ releaseFolderPath }) => ({
    hint: `${MISE_INSTALL}, which installs the release mise.toml pins and links it there`,
    summary: `${releaseFolderPath} does not exist`,
  }),
  [Diagnosis.ReleaseFormatNewer]: ({ format }) => ({
    hint: UPDATE_PLUGIN,
    summary: `the release has block format ${format}, newer than this executable reads`,
  }),
  [Diagnosis.ReleaseFormatOlder]: () => ({
    hint: RAISE_PIN,
    summary: `the release is older than block format ${OLDEST_FORMAT}, the oldest this executable reads`,
  }),
  [Diagnosis.LinkMatches]: ({ link }) => ({
    summary: `${link.linkPath} → ${link.targetPath}`,
  }),
  [Diagnosis.LinkDiffers]: ({ executable, link, release }) => ({
    hint: `${MISE_INSTALL}, so the link and this executable are one release`,
    summary: `${link.linkPath} → ${link.targetPath} holds ${release}, this executable is ${executable}`,
  }),
  [Diagnosis.HooksWithoutProject]: () => ({
    summary: NO_PROJECT,
  }),
  [Diagnosis.HooksInstalled]: () => ({
    summary: "lefthook's hooks are installed",
  }),
  [Diagnosis.HooksMissing]: () => ({
    hint: 'run lefthook install',
    summary: "lefthook's hooks are not installed",
  }),
  [Diagnosis.HooksUnavailable]: () => ({
    hint: 'pin lefthook in mise.toml, then run mise install',
    summary: 'lefthook is not on PATH',
  }),
  [Diagnosis.HooksUnconfigured]: () => ({
    summary: 'the project keeps no lefthook configuration',
  }),
};

const saidOf = <TKind extends Diagnosis>(diagnosis: PartDiagnosis<TKind>): Said =>
  sayings[diagnosis.kind](diagnosis);

const installationOutcomeOf = (diagnoses: readonly PartDiagnosis[]): TaskOutcome => {
  const troubled = diagnoses.filter(PartDiagnosis.isTroubled).length;

  if (troubled === 0) {
    return {
      detail: 'every part is sound',
      status: StepStatus.Done,
    };
  }

  return {
    detail: `${countOf({
      count: troubled,
      noun: 'part',
    })} to look at`,
    status: diagnoses.some((diagnosis) => PartDiagnosis.healthOf(diagnosis) === Health.Broken)
      ? StepStatus.Failed
      : StepStatus.Warned,
  };
};

const installationSectionsOf = (diagnoses: readonly PartDiagnosis[]): readonly Section[] => {
  const said = diagnoses.map((diagnosis) => ({
    label: LABELS[PartDiagnosis.partOf(diagnosis)],
    said: saidOf(diagnosis),
    status: STATUSES[PartDiagnosis.healthOf(diagnosis)],
  }));
  const hints = said.flatMap((part) =>
    part.said.hint === undefined
      ? []
      : [
          `${part.label}: ${part.said.hint}`,
        ],
  );

  return [
    stepsSection(
      said.map((part) => ({
        detail: part.said.summary,
        label: part.label,
        status: part.status,
      })),
    ),
    ...(hints.length === 0
      ? []
      : [
          noteSection({
            lines: hints,
            title: 'What to do',
            tone: Tone.Info,
          }),
        ]),
  ];
};

export { installationOutcomeOf, installationSectionsOf };
