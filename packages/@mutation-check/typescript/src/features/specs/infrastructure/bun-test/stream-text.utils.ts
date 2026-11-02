interface StreamTextInput {
  readonly limitBytes: number;
  readonly stream: ReadableStream<Uint8Array>;
}

// Why: past the limit the read lets the stream go, so a writer that does not stop is stopped by the
// pipe it can no longer write to.
const streamTextOf = async (input: StreamTextInput): Promise<string> => {
  const chunks: Uint8Array[] = [];
  let sizeBytes = 0;

  for await (const chunk of input.stream) {
    chunks.push(chunk);
    sizeBytes += chunk.byteLength;

    if (sizeBytes > input.limitBytes) {
      break;
    }
  }

  return Buffer.concat(chunks).subarray(0, input.limitBytes).toString('utf8');
};

export { streamTextOf };
