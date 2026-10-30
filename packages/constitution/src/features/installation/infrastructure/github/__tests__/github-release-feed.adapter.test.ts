import { describe, expect, it } from 'bun:test';

import { Version } from '#/kernel/value-objects';

import { ReleaseLookup } from '../../../domain/entities';
import { createGitHubReleaseFeed } from '../github-release-feed.adapter';

interface Asked {
  init?: RequestInit;
  url?: string;
}

const feedOf = (input: {
  answer: () => Promise<Response>;
  asked?: Asked;
}): ReturnType<typeof createGitHubReleaseFeed> =>
  createGitHubReleaseFeed({
    fetch: async (url: string, init: RequestInit): Promise<Response> => {
      if (input.asked !== undefined) {
        input.asked.url = url;
        input.asked.init = init;
      }

      return await input.answer();
    },
    timeoutMs: 3000,
  });

describe('createGitHubReleaseFeed', () => {
  it('should give the newest release without its v when GitHub lists one', async () => {
    // Arrange
    const asked: Asked = {};
    const feed = feedOf({
      answer: async (): Promise<Response> =>
        await Promise.resolve(
          Response.json([
            {
              // biome-ignore lint/style/useNamingConvention: GitHub names the field tag_name
              tag_name: 'v0.81.0',
            },
          ]),
        ),
      asked,
    });

    // Act
    const latest = await feed.latest();

    // Assert
    expect({
      headers: asked.init?.headers,
      isBounded: asked.init?.signal instanceof AbortSignal,
      latest,
      url: asked.url,
    }).toStrictEqual({
      headers: {
        accept: 'application/vnd.github+json',
        'user-agent': 'droneey-constitution',
      },
      isBounded: true,
      latest: {
        lookup: ReleaseLookup.Found,
        version: Version.create('0.81.0'),
      },
      url: 'https://api.github.com/repos/droneey/constitution/releases?per_page=1',
    });
  });

  it('should keep a tag that does not open with v as it is', async () => {
    // Arrange
    const feed = feedOf({
      answer: async (): Promise<Response> =>
        await Promise.resolve(
          Response.json([
            {
              // biome-ignore lint/style/useNamingConvention: GitHub names the field tag_name
              tag_name: '0.81.0-preview',
            },
          ]),
        ),
    });

    // Act
    const latest = await feed.latest();

    // Assert
    expect(latest).toStrictEqual({
      lookup: ReleaseLookup.Found,
      version: Version.create('0.81.0-preview'),
    });
  });

  it.each([
    {
      answer: async (): Promise<Response> =>
        await Promise.resolve(
          Response.json([
            {
              // biome-ignore lint/style/useNamingConvention: GitHub names the field tag_name
              tag_name: 81,
            },
          ]),
        ),
      condition: 'the tag is no text',
    },
    {
      answer: async (): Promise<Response> =>
        await Promise.resolve(
          Response.json([
            {
              // biome-ignore lint/style/useNamingConvention: GitHub names the field tag_name
              tag_name: 'nightly',
            },
          ]),
        ),
      condition: 'the tag is no release version',
    },
    {
      answer: async (): Promise<Response> => await Promise.resolve(Response.json([])),
      condition: 'GitHub lists no release',
    },
    {
      answer: async (): Promise<Response> =>
        await Promise.resolve(
          Response.json({
            message: 'Not Found',
          }),
        ),
      condition: 'the answer is of another shape',
    },
    {
      answer: async (): Promise<Response> => await Promise.resolve(new Response('<html>')),
      condition: 'the answer is no JSON',
    },
    {
      answer: async (): Promise<Response> => await Promise.resolve(new Response(null)),
      condition: 'the answer has no body',
    },
  ])('should find the answer unreadable when $condition', async ({ answer }) => {
    // Arrange
    const feed = feedOf({
      answer,
    });

    // Act
    const latest = await feed.latest();

    // Assert
    expect(latest).toStrictEqual({
      lookup: ReleaseLookup.Unreadable,
    });
  });

  it.each([
    {
      condition: 'the network is down',
      failure: new TypeError('fetch failed'),
      reason: 'fetch failed',
    },
    {
      condition: 'GitHub does not answer in time',
      failure: new DOMException('The operation timed out.', 'TimeoutError'),
      reason: 'The operation timed out.',
    },
    {
      condition: 'a proxy refuses the call',
      failure: Object.assign(new Error('Proxy refused to open a tunnel: 403 Forbidden'), {
        code: 'ERR_PROXY_TUNNEL',
      }),
      reason: 'Proxy refused to open a tunnel: 403 Forbidden',
    },
  ])(
    'should find the call unanswered, with what it said, when $condition',
    async ({ failure, reason }) => {
      // Arrange
      const feed = feedOf({
        answer: async (): Promise<Response> => await Promise.reject(failure),
      });

      // Act
      const latest = await feed.latest();

      // Assert
      expect(latest).toStrictEqual({
        lookup: ReleaseLookup.Unanswered,
        reason,
      });
    },
  );

  it('should find the call refused, with its status, when GitHub refuses it', async () => {
    // Arrange
    const refusal = new Response('rate limited', {
      status: 403,
    });
    const feed = feedOf({
      answer: async (): Promise<Response> => await Promise.resolve(refusal),
    });

    // Act
    const latest = await feed.latest();

    // Assert
    expect(latest).toStrictEqual({
      lookup: ReleaseLookup.Refused,
      status: 403,
    });
  });

  it.each([
    {
      body: `[{"tag_name":"v0.81.0","body":"${'x'.repeat(1_048_576)}"}]`,
      condition: 'its answer runs past the size it reads',
    },
    {
      body: `[{"tag_name":"v0.81.0","assets":${'['.repeat(16)}${']'.repeat(16)}}]`,
      condition: 'its answer nests deeper than it reads',
    },
  ])('should find the answer unreadable when $condition', async ({ body }) => {
    // Arrange
    const refused = new Response(body);
    const feed = feedOf({
      answer: async (): Promise<Response> => await Promise.resolve(refused),
    });

    // Act
    const latest = await feed.latest();

    // Assert
    expect(latest).toStrictEqual({
      lookup: ReleaseLookup.Unreadable,
    });
  });

  it('should give the release when its answer is as large and as deep as it reads', async () => {
    // Arrange
    const tag = `{"tag_name":"v0.81.0","assets":${'['.repeat(14)}${']'.repeat(14)},"body":"`;
    const feed = feedOf({
      answer: async (): Promise<Response> =>
        await Promise.resolve(new Response(`[${tag}${'x'.repeat(1_048_576 - tag.length - 4)}"}]`)),
    });

    // Act
    const latest = await feed.latest();

    // Assert
    expect(latest).toStrictEqual({
      lookup: ReleaseLookup.Found,
      version: Version.create('0.81.0'),
    });
  });

  it('should let a failure it does not recognise through', () => {
    // Arrange
    const feed = feedOf({
      answer: async (): Promise<Response> => await Promise.reject(new RangeError('a defect')),
    });

    // Act
    const act = feed.latest();

    // Assert
    expect(act).rejects.toThrow(new RangeError('a defect'));
  });
});
