import { statSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { GIT_CONFIG } from '#/shared/constants';

import { MARKDOWN_EXTENSION, pageSlugsOf } from '../../../domain/entities';
import {
  BLOCKS_FOLDER,
  DOCS_FOLDER,
  GLOSSARY,
  PROJECT_FILE,
  QUICK_START,
  README_FILE,
  SITE_DOCUMENTS,
  siteLayers,
} from './repository.constants';

/** the site builds from its own folder; the path is resolved when asked, since the browser has none */
const inRepository = (path = ''): string => resolve('../..', path);

const blockLayerOf = (path: string): string | undefined =>
  siteLayers.find((layer) => path === `${BLOCKS_FOLDER}${layer}`);

interface RepositoryPath {
  hash: string;
  path: string;
}

const githubAddressOf = (path: string): string => {
  const kind = statSync(inRepository(path), {
    throwIfNoEntry: false,
  })?.isDirectory()
    ? 'tree'
    : 'blob';

  return `https://github.com/${GIT_CONFIG.user}/${GIT_CONFIG.repo}/${kind}/main/${path}`;
};

/** a page where the site renders the file, GitHub's view where it does not */
const addressOf = (baseUrl: string, path: string, hash: string): string => {
  const anchor = hash === '' ? '' : `#${hash}`;

  if (path === README_FILE) {
    // a heading of the README opens with the brand's mark, which GitHub's anchor keeps as a hyphen
    const section = hash.replace(/^-/, '');

    if (section === QUICK_START) {
      return `${baseUrl}/${QUICK_START}`;
    }

    return section === '' ? baseUrl : `${baseUrl}#${section}`;
  }

  if (path.startsWith(DOCS_FOLDER) && path.endsWith(MARKDOWN_EXTENSION)) {
    return `${baseUrl}/${path.slice(DOCS_FOLDER.length, -MARKDOWN_EXTENSION.length)}${anchor}`;
  }

  if (path === PROJECT_FILE && hash === GLOSSARY) {
    return `${baseUrl}/${GLOSSARY}`;
  }

  if (path in SITE_DOCUMENTS) {
    return `${baseUrl}/${SITE_DOCUMENTS[path]}${anchor}`;
  }

  const block = path.startsWith(BLOCKS_FOLDER) ? path.slice(BLOCKS_FOLDER.length) : undefined;

  if (block?.endsWith(MARKDOWN_EXTENSION)) {
    return (
      [
        baseUrl,
        ...pageSlugsOf(block),
      ].join('/') + anchor
    );
  }

  return githubAddressOf(path) + anchor;
};

const repositoryPathOf = (from: string, url: string): RepositoryPath | undefined => {
  if (/^[a-z]+:/i.test(url) || url.startsWith('/')) {
    return undefined;
  }

  const [
    // Stryker disable next-line StringLiteral: a split holds at least one part, so the target's default is never read
    target = '',
    hash = '',
  ] = url.split('#');
  const path = relative(inRepository(), target === '' ? from : resolve(from, '..', target));

  return path.startsWith('..')
    ? undefined
    : {
        hash,
        path,
      };
};

export { addressOf, blockLayerOf, inRepository, repositoryPathOf };
