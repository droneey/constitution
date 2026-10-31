import { SessionAgent } from '../../domain/entities';

interface AgentFileInput {
  readonly agent: SessionAgent;
  readonly name: string;
}

const agentFileNameOf = (input: AgentFileInput): string =>
  input.agent === SessionAgent.main ? input.name : `${input.name}.${input.agent}`;

export { agentFileNameOf };
