# VoltLog

#### Structured logger for real-time infrastructure

[![npm version](https://img.shields.io/npm/v/voltlog-io?color=blue)](https://www.npmjs.com/package/voltlog-io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build & Test](https://github.com/rohittiwari-dev/voltlog-io/actions/workflows/ci.yml/badge.svg)](https://github.com/rohittiwari-dev/voltlog-io/actions)

**VoltLog** is a modern, lightweight, and type-safe structured logger designed specifically for high-throughput, real-time systems like IoT platforms, WebSocket servers (OCPP), and microservices.

## 📚 Full Documentation

For detailed guides, API reference, and advanced usage, please visit:

### [👉 https://ocpp-ws-io.rohittiwari.me/docs/voltlog-io](https://ocpp-ws-io.rohittiwari.me/docs/voltlog-io)

---

## ✨ Key Features

- **🚀 Zero-Dependency Core**: Lightweight and fast.
- **🔒 Secure**: Built-in redaction for sensitive data.
- **📊 High-Throughput**: Intelligent sampling for cost control.
- **⚡ Developer Friendly**: Beautiful pretty printing for local dev.
- **🔌 Flexible**: Works in Node.js, Bun, Deno, and Browsers.

## 📦 Installation

```bash
npm install voltlog-io
```

## 🚀 Quick Start

```ts
import { createLogger, consoleTransport } from "voltlog-io";

const logger = createLogger({
  level: "INFO",
  transports: [consoleTransport()],
});

logger.info("Server started", { port: 3000, env: "production" });
```

### Local Development

For readable, colored logs during development:

```ts
import { createLogger, prettyTransport } from "voltlog-io";

const logger = createLogger({
  level: "DEBUG",
  transports: [prettyTransport({ colorize: true })],
});
```

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md).

## License

[MIT](LICENSE) © [Rohit Tiwari](https://github.com/rohittiwari-dev)
