import { statSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { REPOSITORY_URL } from '#/shared/constants';

import { MARKDOWN_EXTENSION } from '../../../domain/constants';
import { Page } from '../../../domain/entities';
import { withoutMarkdownExtension } from '../../../domain/utils';
import { AbsolutePath, BlockPath, RepositoryPath } from '../../../domain/value-objects';
import {
  blocksFolderPath,
  docsFolderPath,
  GLOSSARY,
  projectFilePath,
  QUICK_START,
  readmeFilePath,
  siteDocuments,
  siteLayers,
} from './repository.constants';

const repositoryRootPath = RepositoryPath.create('');

/** the site builds from its own folder; the path is resolved when asked, since the browser has none */
const inRepository = (repositoryPath: RepositoryPath = repositoryRootPath): AbsolutePath =>
  AbsolutePath.create(resolve('../..', repositoryPath));

const blockLayerOf = (repositoryPath: RepositoryPath): string | undefined => {
  const layer = RepositoryPath.pathBelow(blocksFolderPath, repositoryPath);

  return siteLayers.find((siteLayer) => siteLayer === layer);
};

interface LinkTarget {
  hash: string;
  path: RepositoryPath;
}

const githubAddressOf = (repositoryPath: RepositoryPath): string => {
  const view = statSync(inRepository(repositoryPath), {
    throwIfNoEntry: false,
  })?.isDirectory()
    ? 'tree'
    : 'blob';

  return `${REPOSITORY_URL}/${view}/main/${repositoryPath}`;
};

/** a page where the site renders the file, GitHub's view where it does not */
const addressOf = (baseUrl: string, repositoryPath: RepositoryPath, hash: string): string => {
  const anchor = hash === '' ? '' : `#${hash}`;

  if (repositoryPath === readmeFilePath) {
    // a heading of the README opens with the brand's mark, which GitHub's anchor keeps as a hyphen
    const section = hash.replace(/^-/, '');

    if (section === QUICK_START) {
      return `${baseUrl}/${QUICK_START}`;
    }

    return section === '' ? baseUrl : `${baseUrl}#${section}`;
  }

  const guidePath = RepositoryPath.pathBelow(docsFolderPath, repositoryPath);

  if (guidePath?.endsWith(MARKDOWN_EXTENSION)) {
    return `${baseUrl}/${withoutMarkdownExtension(guidePath)}${anchor}`;
  }

  if (repositoryPath === projectFilePath && hash === GLOSSARY) {
    return `${baseUrl}/${GLOSSARY}`;
  }

  if (Object.hasOwn(siteDocuments, repositoryPath)) {
    return `${baseUrl}/${siteDocuments[repositoryPath]}${anchor}`;
  }

  const blockPath = RepositoryPath.pathBelow(blocksFolderPath, repositoryPath);

  if (BlockPath.is(blockPath)) {
    return `${Page.addressOf(baseUrl, blockPath)}${anchor}`;
  }

  return githubAddressOf(repositoryPath) + anchor;
};

/** undefined for a link that leaves the repository or names a scheme or the host's root */
const linkTargetOf = (fromFilePath: AbsolutePath, url: string): LinkTarget | undefined => {
  if (/^[a-z]+:/i.test(url) || url.startsWith('/')) {
    return undefined;
  }

  const [
    // Stryker disable next-line StringLiteral: a split holds at least one part, so the linked path's default is never read
    linkedPath = '',
    hash = '',
  ] = url.split('#');
  const path = relative(
    inRepository(),
    linkedPath === '' ? fromFilePath : resolve(fromFilePath, '..', linkedPath),
  );

  return RepositoryPath.is(path)
    ? {
        hash,
        path,
      }
    : undefined;
};

export { addressOf, blockLayerOf, inRepository, linkTargetOf };
