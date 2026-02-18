import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { batchTransport } from "../src/transformers/batch.js";
import { LogEntry } from "../src/core/types.js";

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
    const handler = { name: "test", transform: vi.fn() };
    const transport = batchTransport(handler, {
      batchSize: 2,
    });

    transport.transform(mockEntry);
    expect(handler.transform).not.toHaveBeenCalled();

    transport.transform({ ...mockEntry, id: "2" });

    // Batch transport calls inner.transform for each entry
    // It captures errors internally, so we assume it works if handler called

    expect(handler.transform).toHaveBeenCalledTimes(2);
    expect(handler.transform).toHaveBeenCalledWith(mockEntry);
  });

  it("should flush on timer", () => {
    const handler = { name: "test", transform: vi.fn() };
    const transport = batchTransport(handler, {
      batchSize: 10,
      flushIntervalMs: 1000,
    });

    transport.transform(mockEntry);
    expect(handler.transform).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1001);

    expect(handler.transform).toHaveBeenCalledTimes(1);
  });
});
