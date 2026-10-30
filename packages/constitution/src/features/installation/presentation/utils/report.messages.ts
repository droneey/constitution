const latestUnansweredMessage = (reason: string): string =>
  `GitHub could not be reached, so the latest release is unknown: ${reason}`;

const latestRefusedMessage = (status: string): string =>
  `GitHub refused the call with status ${status}, so the latest release is unknown`;

const latestUnreadableMessage = (): string =>
  "GitHub's answer names no release, so the latest release is unknown";

const manifestNotObjectMessage = (manifest: string): string =>
  `${manifest} is no manifest a release writes — it is no JSON object`;

interface ManifestFieldsInput {
  readonly fields: string;
  readonly manifest: string;
}

const manifestFieldsMessage = (input: ManifestFieldsInput): string =>
  `${input.manifest} is no manifest a release writes — fields of another form: ${input.fields}`;

export {
  latestRefusedMessage,
  latestUnansweredMessage,
  latestUnreadableMessage,
  manifestFieldsMessage,
  manifestNotObjectMessage,
};
