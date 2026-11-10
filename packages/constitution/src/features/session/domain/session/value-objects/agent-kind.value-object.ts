const REVIEWER = 'constitution:reviewer';

type AgentKind = string;

const isReviewer = (agentKind: AgentKind | undefined): boolean => agentKind === REVIEWER;

const AgentKind = {
  isReviewer,
} as const;

export { AgentKind };
