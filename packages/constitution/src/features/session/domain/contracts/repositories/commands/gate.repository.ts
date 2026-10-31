import type { AbsolutePath } from '#/kernel/value-objects';

import type {
  AgentInSession,
  GatedRule,
  GateEntry,
  RuleDebt,
  RuleRead,
  RulesRead,
  ShellTree,
} from '../../../entities';
import type { RuleSetHash, SessionId, ToolUseId } from '../../../value-objects';

interface DebtsInput extends AgentInSession {
  readonly debts: readonly RuleDebt[];
}

interface AddGateEntryInput extends AgentInSession {
  readonly entry: GateEntry;
}

interface AddHotRemindedInput extends AgentInSession {
  readonly paths: readonly AbsolutePath[];
}

interface AddRulesReadInput extends AgentInSession {
  readonly rules: readonly RuleRead[];
}

interface WritePartsInput {
  readonly projectFolderPath: AbsolutePath;
  readonly rules: readonly GatedRule[];
  readonly session: SessionId;
  readonly set: RuleSetHash;
}

interface PartInput {
  readonly path: AbsolutePath;
  readonly session: SessionId;
}

interface RulesPart {
  readonly lineCount: number;
  readonly rules: readonly RuleRead[];
}

interface ShellTreeInput {
  readonly call: ToolUseId;
  readonly session: SessionId;
}

interface KeepShellTreeInput extends ShellTreeInput {
  readonly tree: ShellTree;
}

interface SweepStaleSessionsInput {
  readonly projectFolderPath: AbsolutePath;
  readonly session: SessionId;
}

// Why: a write that cannot land is dropped, costing the gate but never the hook. A settled debt is
// resolved no more, and a debt outlives a compaction, which forgets only what was read and shown.
// The session's folder in a project goes when the session ends, or a day after the session last
// wrote there; the rest stays for a resumed session and goes from the state folder 30 days after
// it was last saved, the one bound a session that crashed relies on.
interface GateCommandRepository {
  readonly addDebts: (input: DebtsInput) => void;
  readonly addGateEntry: (input: AddGateEntryInput) => void;
  readonly addHotReminded: (input: AddHotRemindedInput) => void;
  readonly addRulesRead: (input: AddRulesReadInput) => void;
  readonly debts: (input: AgentInSession) => readonly RuleDebt[];
  readonly gateEntries: (input: AgentInSession) => readonly GateEntry[];
  readonly hotReminded: (input: AgentInSession) => ReadonlySet<AbsolutePath>;
  readonly keepShellTree: (input: KeepShellTreeInput) => void;
  readonly partOf: (input: PartInput) => RulesPart | undefined;
  readonly removeSessionFolders: (session: SessionId) => void;
  readonly resetReading: (input: AgentInSession) => void;
  readonly rulesRead: (input: AgentInSession) => RulesRead;
  readonly settleDebts: (input: DebtsInput) => void;
  readonly sweepStaleSessions: (input: SweepStaleSessionsInput) => void;
  readonly takeShellTree: (input: ShellTreeInput) => ShellTree | undefined;
  readonly writeParts: (input: WritePartsInput) => readonly AbsolutePath[];
}

export type {
  AddGateEntryInput,
  AddHotRemindedInput,
  AddRulesReadInput,
  DebtsInput,
  GateCommandRepository,
  KeepShellTreeInput,
  PartInput,
  RulesPart,
  ShellTreeInput,
  SweepStaleSessionsInput,
  WritePartsInput,
};
