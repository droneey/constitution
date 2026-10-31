enum HookEventName {
  SessionStart = 'session-start',
  SubagentStart = 'subagent-start',
  PreToolUse = 'pre-tool-use',
  PostToolUse = 'post-tool-use',
  PostToolUseFailure = 'post-tool-use-failure',
  Stop = 'stop',
  SubagentStop = 'subagent-stop',
  Unknown = 'unknown',
}

export { HookEventName };
