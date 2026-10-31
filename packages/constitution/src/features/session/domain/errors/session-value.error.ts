enum SessionValueFailure {
  SessionId = 'session-id-not-a-plain-name',
  AgentId = 'agent-id-not-a-plain-name',
  ToolUseId = 'tool-use-id-not-a-plain-name',
  TreeFingerprint = 'tree-fingerprint-not-one-line',
  FileSignature = 'file-signature-not-one-line',
  RuleHash = 'rule-hash-not-hexadecimal',
  RuleSetHash = 'rule-set-hash-not-hexadecimal',
  RefusalKey = 'refusal-key-not-hexadecimal',
}

export { SessionValueFailure };
