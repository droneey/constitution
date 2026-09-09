import { checkBlocks } from './check-blocks';
import { nodeFileTree } from './file-tree';

const findings = checkBlocks(nodeFileTree(process.cwd()));

for (const finding of findings) {
  process.stdout.write(`${finding.path}: ${finding.message}\n`);
}

process.stdout.write(
  findings.length === 0
    ? 'blocks: every manifest, assembly and chapter is sound\n'
    : `blocks: ${findings.length} finding(s)\n`,
);
process.exit(findings.length === 0 ? 0 : 1);
