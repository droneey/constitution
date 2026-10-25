import type { RuleSlug, UnitPath } from '#/kernel/value-objects';

/** A template of a tool that a planned file takes, with the parts it takes there. */
interface PlannedTool {
  /** whether the file's folder adds the tool, which the repository does not follow */
  readonly isAdded: boolean;
  /** each part's file, by the path the configuration names it by, in their order */
  readonly parts: readonly string[];
  /** the template's path as a project names it */
  readonly template: string;
  readonly tool: string;
}

interface PlannedScope {
  readonly scope: string;
  readonly tools: readonly PlannedTool[];
}

/** A configuration file the project's tools read, kept or to be written. */
interface PlannedFile {
  /** by its path from the repository */
  readonly file: string;
  /** whether its folder keeps no file at its path yet */
  readonly isNew: boolean;
  /** the rule the overrides of the unit it lies in lower, when they lower it */
  readonly lowers?: RuleSlug;
  /** common first, then the languages of its units, in the order of the blocks */
  readonly scopes: readonly PlannedScope[];
  readonly units: readonly UnitPath[];
}

/** A tool whose presets hold parts of a scope that no template of it takes. */
interface UntemplatedTool {
  readonly scope: string;
  readonly tool: string;
}

interface WiringPlan {
  readonly files: readonly PlannedFile[];
  /** each once, in the order of the units and their scopes */
  readonly untemplated: readonly UntemplatedTool[];
}

export type { PlannedFile, PlannedScope, PlannedTool, UntemplatedTool, WiringPlan };
