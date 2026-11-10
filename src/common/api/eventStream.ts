export interface ServerSentEvent {
  data: string;
  event: string;
}

export function isEventStreamResponse(response: Response) {
  return (
    response.headers
      .get("Content-Type")
      ?.toLowerCase()
      .startsWith("text/event-stream") ?? false
  );
}

function parseEventBlock(block: string): ServerSentEvent | null {
  let event = "message";
  const dataLines: string[] = [];

  for (const line of block.split("\n")) {
    if (!line || line.startsWith(":")) continue;
    const separatorIndex = line.indexOf(":");
    const field = separatorIndex === -1 ? line : line.slice(0, separatorIndex);
    let value = separatorIndex === -1 ? "" : line.slice(separatorIndex + 1);
    if (value.startsWith(" ")) value = value.slice(1);

    if (field === "event") event = value;
    if (field === "data") dataLines.push(value);
  }

  return dataLines.length ? { data: dataLines.join("\n"), event } : null;
}

// Reads a fetch body as text/event-stream; EventSource cannot POST and would re-run the request on reconnect.
export async function* readServerSentEvents(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<ServerSentEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let isFinished = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        isFinished = true;
        // An event without its closing blank line is incomplete and is dropped.
        return;
      }

      buffer += decoder.decode(value, { stream: true });
      // Keep a trailing "\r" until the next chunk shows whether it starts a "\r\n".
      const pendingCarriageReturn = buffer.endsWith("\r") ? "\r" : "";
      const text = (pendingCarriageReturn ? buffer.slice(0, -1) : buffer).replace(/\r\n?/g, "\n");
      const blocks = text.split("\n\n");
      buffer = blocks.pop() + pendingCarriageReturn;

      for (const block of blocks) {
        const event = parseEventBlock(block);
        if (event) yield event;
      }
    }
  } finally {
    // The caller may stop early after the final event; cancel so the connection is not left open.
    if (!isFinished) await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
