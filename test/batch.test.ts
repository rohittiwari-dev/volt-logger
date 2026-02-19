import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LogEntry } from "../src/core/types.js";
import { batchTransport } from "../src/transports/batch.js";

describe("Batch Transport", () => {
  const mockEntry: LogEntry = {
    id: "abc",
    level: 30,
    levelName: "INFO",
    message: "test",
    timestamp: Date.now(),
    meta: {},
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should batch entries and flush when size reached", () => {
    const handler = { name: "test", write: vi.fn() };
    const transport = batchTransport(handler, {
      batchSize: 2,
    });

    transport.write(mockEntry);
    expect(handler.write).not.toHaveBeenCalled();

    transport.write({ ...mockEntry, id: "2" });

    // Batch transport calls inner.write for each entry
    // It captures errors internally, so we assume it works if handler called

    expect(handler.write).toHaveBeenCalledTimes(2);
    expect(handler.write).toHaveBeenCalledWith(mockEntry);
  });

  it("should flush on timer", () => {
    const handler = { name: "test", write: vi.fn() };
    const transport = batchTransport(handler, {
      batchSize: 10,
      flushIntervalMs: 1000,
    });

    transport.write(mockEntry);
    expect(handler.write).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1001);

    expect(handler.write).toHaveBeenCalledTimes(1);
  });

  it("should call inner flush and close", async () => {
    const handler = {
      name: "test",
      write: vi.fn(),
      flush: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    };
    const transport = batchTransport(handler);

    transport.write(mockEntry); // Buffered

    await transport.flush!(); // Should flush buffer and call inner.flush
    expect(handler.write).toHaveBeenCalledTimes(1);
    expect(handler.flush).toHaveBeenCalledTimes(1);

    await transport.close!(); // Should flush and call inner.close
    expect(handler.close).toHaveBeenCalledTimes(1);
  });

  it("should swallow errors from inner transport", async () => {
    const handler = {
      name: "test",
      level: "INFO" as const,
      write: vi.fn(),
    };
    const transport = batchTransport(handler, { batchSize: 1 });

    // Sync error
    handler.write.mockImplementationOnce(() => {
      throw new Error("Sync Fail");
    });
    transport.write(mockEntry); // Should not throw

    // Async error
    handler.write.mockResolvedValueOnce(
      Promise.reject(new Error("Async Fail")),
    );
    transport.write(mockEntry); // Should not throw

    // Allow promise rejection to handle
    vi.advanceTimersByTime(10);
  });
});
