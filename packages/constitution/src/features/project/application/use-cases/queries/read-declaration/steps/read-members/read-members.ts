import { CONFIG_FILE_NAME } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import { ConfigReadStatus, FileReadStatus } from '#/kernel/entities';
import type { UnitPath } from '#/kernel/value-objects';
import { AbsolutePath } from '#/kernel/value-objects';

import type { DeclaredUnit, UnreadMember } from '../../../../../../domain/project-config/entities';
import { MemberProblem } from '../../../../../../domain/project-config/entities';
import type { ConfigParser, Workspace } from '../../../../../contracts';

interface ReadMembersInput {
  readonly configParser: ConfigParser;
  readonly files: ProjectFiles;
  readonly repositoryFolderPath: AbsolutePath;
  readonly workspace: Workspace;
}

interface MembersRead {
  readonly declared: readonly DeclaredUnit[];
  readonly unread: readonly UnreadMember[];
}

interface MemberReadInput extends Omit<ReadMembersInput, 'workspace'> {
  readonly path: UnitPath;
}

const unread = (member: UnreadMember): MembersRead => ({
  declared: [],
  unread: [
    member,
  ],
});

const memberRead = (input: MemberReadInput): MembersRead => {
  const { path } = input;
  const read = input.files.read(
    AbsolutePath.join(AbsolutePath.join(input.repositoryFolderPath, path), CONFIG_FILE_NAME),
  );

  if (read.status !== FileReadStatus.Read) {
    return unread({
      path,
      problem:
        read.status === FileReadStatus.Missing ? MemberProblem.Missing : MemberProblem.Unreadable,
    });
  }

  const parsed = input.configParser.parse(read.text);

  return parsed.status === ConfigReadStatus.Unparsed
    ? unread({
        lines: parsed.lines,
        path,
        problem: MemberProblem.Unparsed,
      })
    : {
        declared: [
          {
            config: parsed.config,
            path,
          },
        ],
        unread: [],
      };
};

const readMembers = (input: ReadMembersInput): MembersRead => {
  const reads = input.workspace.membersOf(input.repositoryFolderPath).map((path) =>
    memberRead({
      ...input,
      path,
    }),
  );

  return {
    declared: reads.flatMap((read) => read.declared),
    unread: reads.flatMap((read) => read.unread),
  };
};

export { readMembers };
