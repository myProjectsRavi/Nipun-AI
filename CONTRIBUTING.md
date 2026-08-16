# 🤝 Contributing to Nipun AI

Thank you for your interest in contributing! Nipun AI is an open-source project and we welcome contributions from everyone.

---

## Quick Start

**Prerequisite:** Node.js 22 or newer.

```bash
# 1. Fork the repo on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/Nipun-AI.git
cd Nipun-AI

# 3. Start the Worker (Terminal 1)
cd worker && npm ci --no-fund && npx wrangler dev

# 4. Start the Frontend (Terminal 2)
cd frontend && npm ci --no-fund && npm run dev

# 5. Create a branch
git checkout -b feat/your-feature-name
```

For the end-user one-command launcher, use `npx nipun-ai@latest` rather than a development checkout.

---

## Project Structure

| Directory | Purpose | Language |
|---|---|---|
| `frontend/src/` | React SPA (Cloudflare Pages) | TypeScript + React |
| `worker/src/` | Cloudflare Worker API | TypeScript |
| `cli/` | Published `nipun-ai` npm launcher | JavaScript (ES modules) |

---

## Development Guidelines

### Code Style

- **TypeScript**: Strict mode, no `any` types (use proper interfaces from `types.ts`)
- **Formatting**: Use the repository Prettier configuration and keep CI green
- **Comments**: Document *why*, not *what* — the code should be self-explanatory
- **Naming**: `camelCase` for variables/functions, `PascalCase` for types/components

### Architecture Principles

1. **Zero infrastructure** — No new databases, queues, or servers. Everything runs on Cloudflare free tier.
2. **Zero dependencies (where possible)** — Prefer Web APIs over npm packages. Every dependency is a liability.
3. **Graceful degradation** — Every external API call must have a try/catch with a mock data fallback.
4. **Phase separation** — Data fetching, computation, AI synthesis, and secondary AI are separate phases. Don't mix them.
5. **Type safety** - All interfaces must be defined in `shared/types.ts` (single source of truth).
6. **Reproducible installs** — Keep npm lockfiles synchronized and use `npm ci` in CI/release paths.
7. **No secrets in Git** — Never commit API keys, npm tokens, private certificates, `.env` secrets, or personal credentials.

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

- **Unit tests** for `compute.ts` (pure functions, easy to test)
- **CLI ticker support** (`npx nipun-ai@latest AAPL`) — add direct ticker arg to CLI for terminal-based analysis
- **International market support** (BSE/NSE/LSE tickers)
- **Portfolio mode** (multi-stock dashboard)
- **Embeddable widget** for blogs and websites

### What NOT to Submit

- Changes that add server-side state (databases, sessions, etc.)
- Changes that require paid services without free tier alternatives
- Changes that store API keys on the server
- Large dependency additions without justification
- Secrets, private keys, access tokens, or confidential user data

---

## Pull Request Process

1. **Branch** from `main` with a descriptive name (`feat/`, `fix/`, `docs/`)
2. **Test** your changes locally with both Worker and Frontend running
3. **Type-check**: Run `npx tsc --noEmit` in both `worker/` and `frontend/`
4. **CLI changes**: Run `cd cli && npm ci && npm run check`
5. **Describe** your changes clearly in the PR description
6. **Link** any related issues

---

## Reporting Bugs

When filing a bug report, include:

1. **Ticker** used (if applicable)
2. **Mode**: Demo or Live (never include API key values)
3. **Browser** and version
4. **Console errors** with secrets redacted
5. **Expected** vs **actual** behavior

---

## Security Issues

See [SECURITY.md](SECURITY.md) for how to report security vulnerabilities privately. **Do NOT open public issues for security bugs.**

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
