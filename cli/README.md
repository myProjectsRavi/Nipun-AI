# 🧠 Nipun AI CLI

One-command local launcher for [Nipun AI](https://github.com/myProjectsRavi/Nipun-AI), the open-source AI stock analysis platform.

## Run

```bash
npx nipun-ai@latest
```

The CLI opens Nipun AI in your browser after starting the local frontend and Cloudflare Worker.

## Requirements

- Node.js 22 or newer
- npm (included with Node.js)
- Internet access on the first launch of a new Nipun AI release

No global install is required.

## Deterministic releases

Each npm CLI version installs the matching GitHub release tag. For example, `nipun-ai@2.0.0` installs GitHub release `v2.0.0` under:

```text
~/.nipun-ai/releases/2.0.0/
```

Dependencies are installed from the repository lockfiles using `npm ci`. A verified release is reused on subsequent launches, so the CLI does not reinstall dependencies every time.

The CLI never overwrites a manually cloned `~/nipun-ai` directory and never terminates unrelated processes that happen to use the default ports. If ports 8787 or 5173 are busy, safe alternative local ports are selected automatically.

## Diagnostics

```bash
npx nipun-ai@latest --doctor
```

This checks the local Node/npm environment, release cache, extraction tools, and default port availability without printing API keys or other secrets.

## Other commands

```bash
npx nipun-ai@latest --version
npx nipun-ai@latest --help
```

## Security and privacy

Nipun AI is BYOK. Do not paste API keys into terminal commands, GitHub issues, or logs. Report security issues using the private process documented in the repository's [SECURITY.md](https://github.com/myProjectsRavi/Nipun-AI/blob/main/SECURITY.md).

## Links

- GitHub: https://github.com/myProjectsRavi/Nipun-AI
- Live demo: https://nipun-ai.pages.dev/
- Issues: https://github.com/myProjectsRavi/Nipun-AI/issues
- License: MIT
