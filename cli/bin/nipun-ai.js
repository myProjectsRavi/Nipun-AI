#!/usr/bin/env node

import { runCli } from '../lib/cli.js';

runCli().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Nipun AI could not start: ${message}`);
    console.error('   Run `npx nipun-ai@latest --doctor` for environment diagnostics.');
    process.exitCode = 1;
});
