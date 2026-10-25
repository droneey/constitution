import { CONFIG_FILE } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import { ConfigReadStatus, FileRead } from '#/kernel/entities';

import type { ConfigParser, Workspace } from '../../../../../contracts';
import type { DeclaredUnit, UnreadMember } from '../../../../../entities';
import { MemberProblem } from '../../../../../entities';
import { joinPath } from '../../../shared/project-paths';

interface ReadMembersInput {
  readonly configParser: ConfigParser;
  readonly files: ProjectFiles;
  readonly project: string;
  readonly workspace: Workspace;
}

const readMembers = (
  input: ReadMembersInput,
): {
  readonly declared: readonly DeclaredUnit[];
  readonly unread: readonly UnreadMember[];
} => {
  const declared: DeclaredUnit[] = [];
  const unread: UnreadMember[] = [];

  for (const path of input.workspace.membersOf(input.project)) {
    const file = joinPath({
      folder: joinPath({
        folder: input.project,
        name: path,
      }),
      name: CONFIG_FILE,
    });
    const isFile = input.files.isFile(file);
    const text = isFile ? FileRead.textOf(input.files.read(file)) : undefined;
    const read = text === undefined ? undefined : input.configParser.parse(text);

    if (read === undefined) {
      unread.push({
        path,
        problem: isFile ? MemberProblem.Unreadable : MemberProblem.Missing,
      });
    } else if (read.status === ConfigReadStatus.Unparsed) {
      unread.push({
        line: read.line,
        path,
        problem: MemberProblem.Unparsed,
      });
    } else {
      declared.push({
        config: read.config,
        path,
      });
    }
  }

  return {
    declared,
    unread,
  };
};

export { readMembers };
