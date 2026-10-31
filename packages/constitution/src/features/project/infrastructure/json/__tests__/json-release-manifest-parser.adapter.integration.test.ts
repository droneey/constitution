import { describe, expect, it } from 'bun:test';

import { Version } from '#/kernel/value-objects';

import { ManifestReadStatus } from '../../../application/contracts';
import { createJsonReleaseManifestParser } from '../json-release-manifest-parser.adapter';

describe('createJsonReleaseManifestParser', () => {
  it.each([
    {
      condition: 'the manifest names its block format and release version',
      json: '{"name": "@droneey/constitution", "version": "2.0.0-rc.1", "constitutionFormat": 4}',
      manifest: {
        blockFormat: 4,
        version: Version.create('2.0.0-rc.1'),
      },
    },
    {
      condition: 'a nested object names a version and a format',
      json: '{"scripts": {"version": "changeset version"}, "droneey": {"constitutionFormat": 9}}',
      manifest: {},
    },
  ])('should read what the manifest names when $condition', ({ json, manifest }) => {
    // Arrange
    const parser = createJsonReleaseManifestParser();

    // Act
    const read = parser.parse(json);

    // Assert
    expect(read).toStrictEqual({
      manifest,
      status: ManifestReadStatus.Read,
    });
  });

  it.each([
    {
      condition: 'the manifest is no JSON',
      json: '{"version": "1.0.0",',
    },
    {
      condition: 'the manifest is no JSON object',
      json: '["version", "1.0.0"]',
    },
  ])('should find the manifest no JSON object when $condition', ({ json }) => {
    // Arrange
    const parser = createJsonReleaseManifestParser();

    // Act
    const read = parser.parse(json);

    // Assert
    expect(read).toStrictEqual({
      status: ManifestReadStatus.NotObject,
    });
  });

  it.each([
    {
      condition: 'the version is no text',
      fields: [
        'version',
      ],
      json: '{"version": 1}',
    },
    {
      condition: 'the version is text but no release version',
      fields: [
        'version',
      ],
      json: '{"version": "next", "constitutionFormat": 4}',
    },
    {
      condition: 'the format is no whole number',
      fields: [
        'constitutionFormat',
      ],
      json: '{"version": "1.0.0", "constitutionFormat": 4.5}',
    },
  ])(
    'should find the manifest malformed, naming the fields of another form, when $condition',
    ({ fields, json }) => {
      // Arrange
      const parser = createJsonReleaseManifestParser();

      // Act
      const read = parser.parse(json);

      // Assert
      expect(read).toStrictEqual({
        fields,
        status: ManifestReadStatus.Malformed,
      });
    },
  );
});
