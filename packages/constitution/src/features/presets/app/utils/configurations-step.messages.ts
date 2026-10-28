interface WarningLineInput {
  readonly code: string;
  readonly text: string;
}

const WARNING_NOUN = 'warning';

const SOUND = 'constitution.yaml and its configurations are sound';
const WARNINGS_AFTER = 'in the project';
const FINDINGS_AFTER = 'in the configurations';

const warningLineMessage = ({ code, text }: WarningLineInput): string => `${code}: ${text}`;

export { FINDINGS_AFTER, SOUND, WARNING_NOUN, WARNINGS_AFTER, warningLineMessage };
