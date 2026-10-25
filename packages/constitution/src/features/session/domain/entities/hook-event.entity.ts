/** Claude Code's events the session's hooks tell apart; any other is Unknown. */
enum HookEventName {
  SessionStart = 'session-start',
  SubagentStart = 'subagent-start',
  Stop = 'stop',
  SubagentStop = 'subagent-stop',
  Unknown = 'unknown',
}

export { HookEventName };
