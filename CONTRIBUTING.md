# 🤝 Contributing to Nipun AI

Thank you for your interest in contributing! Nipun AI is an open-source project and we welcome contributions from everyone.

---

## Quick Start

```bash
# 1. Fork the repo on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/Nipun-AI.git
cd Nipun-AI

# 3. Start the Worker (Terminal 1)
cd worker && npm install && npx wrangler dev

# 4. Start the Frontend (Terminal 2)
cd frontend && npm install && npm run dev

# 5. Create a branch
git checkout -b feat/your-feature-name
```

---

## Project Structure

| Directory | Purpose | Language |
|---|---|---|
| `frontend/src/` | React SPA (Cloudflare Pages) | TypeScript + React |
| `worker/src/` | Cloudflare Worker API | TypeScript |

---

## Development Guidelines

### Code Style

- **TypeScript**: Strict mode, no `any` types (use proper interfaces from `types.ts`)
- **Formatting**: Use your editor's default formatter — consistency matters more than style
- **Comments**: Document *why*, not *what* — the code should be self-explanatory
- **Naming**: `camelCase` for variables/functions, `PascalCase` for types/components

### Architecture Principles

1. **Zero infrastructure** — No new databases, queues, or servers. Everything runs on Cloudflare free tier.
2. **Zero dependencies (where possible)** — Prefer Web APIs over npm packages. Every dependency is a liability.
3. **Graceful degradation** — Every external API call must have a try/catch with a mock data fallback.
4. **Phase separation** — Data fetching, computation, AI synthesis, and secondary AI are separate phases. Don't mix them.
5. **Type safety** - All interfaces must be defined in `shared/types.ts` (single source of truth).

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add options flow analysis module
fix: handle null earnings in computeNipunScore
refactor: extract SentimentCard from ReportViewer
docs: add API endpoint documentation
```

---

## What to Contribute

### Good First Issues

- Add `React.memo()` to ReportViewer sub-sections
- Extract a ReportViewer section into its own component
- Add ARIA labels to interactive elements
- Improve error messages for specific API failures

### High-Impact Contributions

- **Unit tests** for `compute.ts` (10 pure functions, easy to test)
- **CLI ticker support** (`npx nipun-ai AAPL`) — add direct ticker arg to CLI for terminal-based analysis
- **International market support** (BSE/NSE/LSE tickers)
- **Portfolio mode** (multi-stock dashboard)
- **Embeddable widget** for blogs and websites

### What NOT to Submit

- Changes that add server-side state (databases, sessions, etc.)
- Changes that require paid services without free tier alternatives
- Changes that store API keys on the server
- Large dependency additions without justification

---

## Pull Request Process

1. **Branch** from `main` with a descriptive name (`feat/`, `fix/`, `docs/`)
2. **Test** your changes locally with both Worker and Frontend running
3. **Type-check**: Run `npx tsc --noEmit` in both `worker/` and `frontend/`
4. **Describe** your changes clearly in the PR description
5. **Link** any related issues

---

## Reporting Bugs

When filing a bug report, include:

1. **Ticker** used (if applicable)
2. **Mode**: Demo or Live (with which keys configured)
3. **Browser** and version
4. **Console errors** (if any)
5. **Expected** vs **actual** behavior

---

## Security Issues

See [SECURITY.md](SECURITY.md) for how to report security vulnerabilities. Open a [GitHub Issue](https://github.com/myProjectsRavi/Nipun-AI/issues/new) with `[SECURITY]` in the title — include a brief, non-exploitable description.

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
