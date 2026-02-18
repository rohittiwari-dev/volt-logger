# VoltLog

#### Structured logger for real-time infrastructure

[![npm version](https://img.shields.io/npm/v/volt-logger?color=blue)](https://www.npmjs.com/package/volt-logger)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build & Test](https://github.com/rohittiwari-dev/volt-logger/actions/workflows/ci.yml/badge.svg)](https://github.com/rohittiwari-dev/volt-logger/actions)

**VoltLog** is a modern, lightweight, and type-safe structured logger designed specifically for high-throughput, real-time systems like IoT platforms, WebSocket servers (OCPP), and microservices.

It’s built to solve the common pain points of generic loggers in event-driven architectures: context tracking, sensitive data redaction, high-volume sampling, and developer experience.

---

## ✨ Features

- **🚀 Zero-Dependency Core**: Only uses `cuid2` for IDs — no massive dependency tree.
- **🔒 Secure by Design**: Built-in redaction middleware for passwords, tokens, and headers.
- **📊 High-Throughput Ready**: Intelligent sampling middleware to log 1% of debug logs while keeping 100% of errors.
- **⚡ Developer Experience**: Beautiful, icon-rich pretty printing for local development.
- **🔌 Framework Agnostic**: Works in Node.js, Bun, Deno, and Browsers.
- **🧩 Pluggable Architecture**: Middleware and Transformers let you build custom pipelines easily.

---

## 📦 Installation

```bash
npm install volt-logger
# or
bun add volt-logger
pnpm add volt-logger
yarn add volt-logger
```

---

## 🚀 Quick Start

### Basic Usage

```ts
import { createLogger, consoleTransport } from "volt-logger";

const logger = createLogger({
  level: "INFO",
  transports: [consoleTransport()],
});

logger.info("Server started", { port: 3000, env: "production" });
// {"level":30,"message":"Server started","meta":{"port":3000,"env":"production"},"timestamp":1700000000000}
```

### Local Development (Pretty Print)

Use `prettyTransport` to get readable, colored logs with icons during development.

```ts
import { createLogger, prettyTransport } from "volt-logger";

const logger = createLogger({
  level: "DEBUG",
  transports: [prettyTransport({ colorize: true })],
});

logger.info("Server listening", { port: 3000 });
// ℹ 10:30:00.123  INFO   Server listening  {"port":3000}
```

---

## 💡 Key Concepts & Use Cases

### 1. Context Binding (Child Loggers)

Perfect for tracking requests, WebSocket connections, or charging sessions. Bind context once, and all subsequent logs inherit it.

```ts
// Global logger
const logger = createLogger({
  level: "INFO",
  transports: [consoleTransport()],
});

// Create a child logger for a specific connection
const connLogger = logger.child({
  connectionId: "conn-123",
  ip: "192.168.1.10",
});

connLogger.info("Connected");
// Logs: message="Connected" + { connectionId: "...", ip: "..." }

connLogger.warn("High latency");
// Logs: message="High latency" + { connectionId: "...", ip: "..." }
```

### 2. Sensitive Data Redaction

Automatically scrub sensitive fields before they hit your logs. Essential for GDPR/security compliance.

```ts
import { createLogger, consoleTransport, redactionMiddleware } from "volt-logger";

const logger = createLogger({
  transports: [consoleTransport()],
  middleware: [
    redactionMiddleware({
      paths: ["password", "token", "headers.authorization", "user.secrets"],
    }),
  ],
});

logger.info("User login", {
  username: "alice",
  password: "supersecretpassword",
});
// {"message":"User login","meta":{"username":"alice","password":"[REDACTED]"}}
```

### 3. Sampling (Cost Control)

In high-throughput systems (like OCPP servers handling thousands of chargers), `DEBUG` logs can be overwhelming and expensive to store. Use sampling to log only a fraction of them.

```ts
import { createLogger, consoleTransport, samplingMiddleware } from "volt-logger";

const logger = createLogger({
  level: "DEBUG",
  transports: [consoleTransport()],
  middleware: [
    samplingMiddleware({
      rate: 0.1, // Keep 10% of logs
      level: "DEBUG", // Only sample DEBUG logs (keep 100% of INFO/WARN/ERROR)
    }),
  ],
});
```

### 4. Custom Transports

Send logs to files, databases, or external services like Datadog/CloudWatch.

```ts
const fileTransport = {
  name: "file",
  transform: (entry) => {
    fs.appendFileSync("app.log", JSON.stringify(entry) + "\n");
  },
};

const logger = createLogger({
  transports: [consoleTransport(), fileTransport],
});
```

---

## 🛠️ Transports

Transports determine where your logs go. You can combine multiple transports.

### `consoleTransport`

Writes logs to `stdout` as single-line JSON. Best for production.

```ts
transports: [consoleTransport({ level: "INFO" })];
```

### `prettyTransport`

Writes colorful, human-readable logs to `stdout`. Best for local dev.

```ts
transports: [prettyTransport({ colorize: true, level: "DEBUG" })];
```

### `batchTransport`

Buffers logs and writes them in chunks. High performance for I/O bound transports.

```ts
transports: [
  batchTransport({
    batchSize: 100,
    flushIntervalMs: 5000,
    transport: webhookTransport({ url: "..." }),
  }),
];
```

### `jsonStreamTransport`

Writes logs as newline-delimited JSON (NDJSON) to a writable stream (like a file).

```ts
import { createWriteStream } from "node:fs";
const stream = createWriteStream("app.log");
transports: [jsonStreamTransport({ stream })];
```

### `webhookTransport`

Sends logs to an external HTTP endpoint (Slack, Discord, Logstash).

```ts
transports: [
  webhookTransport({
    url: "https://hooks.slack.com/services/...",
    batchSize: 10, // Batches requests automatically
  }),
];
```

### `redisTransport`

Publishes logs to a Redis channel or pushes to a list/stream.

```ts
import Redis from "ioredis";
const redis = new Redis();
transports: [
  redisTransport({
    client: redis,
    channel: "app-logs",
    mode: "pubsub", // or 'stream' / 'list'
  }),
];
```

---

## 🛡️ Middleware

Middleware transforms, filters, or enriches logs _before_ they reach the transports.

### `redactionMiddleware`

Removes sensitive fields from log objects. Supports dot notation for nested fields.

```ts
middleware: [
  redactionMiddleware({
    paths: ["password", "token", "user.creditCard", "headers.authorization"],
    censor: "[SECRET]",
  }),
];
```

### `samplingMiddleware`

Reduces log volume by only keeping a percentage of logs. Useful for high-volume debug logs.

```ts
middleware: [
  samplingMiddleware({
    rate: 0.05, // Keep 5%
    level: "DEBUG", // Apply only to DEBUG level (keep all INFO/ERROR)
  }),
];
```

### `alertMiddleware`

Trigger callbacks when specific conditions are met (e.g. error rate spike).

```ts
middleware: [
  alertMiddleware({
    match: (entry) => entry.level >= 50, // Errors
    onAlert: (entry) => sendToSlack(entry),
    throttleMs: 60000, // Only alert once per minute
  }),
];
```

### `ocppMiddleware`

Specialized middleware for OCPP messages. Adds directionality and styling when combined with pretty print.

```ts
middleware: [
  ocppMiddleware(), // Adds { direction: 'IN' | 'OUT' } to logs
];
```

---

## 🧩 Custom Middleware

You can easily write your own middleware to enrich, filter, or transform logs. Middleware is just a function that takes an `entry` and a `next` callback.

### Example: Enriching Logs with Machine Info

```ts
import { os } from "node:os";
import { createLogger, createMiddleware, consoleTransport } from "volt-logger";

const machineInfoMiddleware = createMiddleware((entry, next) => {
  // Add hostname to every log
  entry.meta = {
    ...entry.meta,
    hostname: os.hostname(),
    pid: process.pid,
  };

  // Continue pipeline
  next(entry);
};

// Usage
const logger = createLogger({
  middleware: [machineInfoMiddleware],
  transports: [consoleTransport()],
});
```

### Example: Filtering Logs

```ts
import { createMiddleware } from "volt-logger";

const filterMiddleware = createMiddleware((entry, next) => {
  // Drop logs containing specific text
  if (entry.message.includes("Heartbeat")) {
    return; // Don't call next(), effectively dropping the log
  }
  next(entry);
};
```

---

## 📚 API Reference

### `createLogger(config)`

Creates a new logger instance.

| Config Option | Type            | Default  | Description                                                            |
| ------------- | --------------- | -------- | ---------------------------------------------------------------------- |
| `level`       | `LogLevelName`  | `"INFO"` | Minimum log level (`TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`) |
| `transports`  | `Transformer[]` | `[]`     | Array of output transformers (console, pretty, file, etc.)             |
| `middleware`  | `Middleware[]`  | `[]`     | Array of middleware functions (redaction, sampling, enrichment)        |

### Log Levels

| Level   | Value | Usage                                                             |
| ------- | ----- | ----------------------------------------------------------------- |
| `FATAL` | 60    | System is unusable, requires immediate attention.                 |
| `ERROR` | 50    | Error conditions that affect operation but don't stop the system. |
| `WARN`  | 40    | Runtime warnings (deprecated APIs, poor performance).             |
| `INFO`  | 30    | Normal operational messages (startup, shutdown).                  |
| `DEBUG` | 20    | Detailed info useful for debugging (state changes).               |
| `TRACE` | 10    | Very detailed tracing (function entry/exit, full payloads).       |

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE) © [Rohit Tiwari](https://github.com/rohittiwari-dev)
