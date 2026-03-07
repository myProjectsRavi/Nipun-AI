#!/usr/bin/env node

// ─────────────────────────────────────────────────────────────────
// 🧠 Nipun AI CLI — One-Command Setup & Launch
// Usage: npx nipun-ai
// ─────────────────────────────────────────────────────────────────

import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync, createWriteStream, unlinkSync, renameSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { homedir, platform } from 'os';
import https from 'https';
import { createUnzip } from 'zlib';

const REPO = 'myProjectsRavi/Nipun-AI';
const ZIP_URL = `https://github.com/${REPO}/archive/refs/heads/main.zip`;
const INSTALL_DIR = join(homedir(), 'nipun-ai');

// ── Colors ───────────────────────────────────────────────────────
const c = {
    green: (s) => `\x1b[32m${s}\x1b[0m`,
    yellow: (s) => `\x1b[33m${s}\x1b[0m`,
    cyan: (s) => `\x1b[36m${s}\x1b[0m`,
    red: (s) => `\x1b[31m${s}\x1b[0m`,
    bold: (s) => `\x1b[1m${s}\x1b[0m`,
    dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

// ── Helpers ──────────────────────────────────────────────────────
function log(msg) { console.log(msg); }
function step(n, total, msg) { log(`${c.yellow(`[${n}/${total}]`)} ${msg}`); }

function run(cmd, cwd) {
    try {
        execSync(cmd, { cwd, stdio: 'pipe', env: { ...process.env, PAGER: 'cat' } });
        return true;
    } catch {
        return false;
    }
}

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const follow = (url) => {
            https.get(url, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    follow(res.headers.location);
                    return;
                }
                if (res.statusCode !== 200) {
                    reject(new Error(`Download failed: HTTP ${res.statusCode}`));
                    return;
                }
                const file = createWriteStream(dest);
                res.pipe(file);
                file.on('finish', () => { file.close(); resolve(); });
                file.on('error', reject);
            }).on('error', reject);
        };
        follow(url);
    });
}

function openBrowser(url) {
    const cmd = platform() === 'darwin' ? 'open' :
                platform() === 'win32' ? 'start' : 'xdg-open';
    try { execSync(`${cmd} ${url}`, { stdio: 'ignore' }); } catch { /* ignore */ }
}

function killPort(port) {
    try {
        if (platform() === 'win32') {
            execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, { stdio: 'pipe' });
            // Windows port killing is complex, skip for now
        } else {
            execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null`, { stdio: 'pipe', shell: true });
        }
    } catch { /* nothing on that port — fine */ }
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
    log('');
    log(c.cyan('🧠 Nipun AI — The Open-Source Bloomberg Alternative'));
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('');

    // ── 1. Check Node.js version ──
    const nodeVersion = parseInt(process.versions.node.split('.')[0]);
    if (nodeVersion < 18) {
        log(c.red(`❌ Node.js 18+ required. You have v${process.versions.node}.`));
        log(`   Update from: https://nodejs.org`);
        process.exit(1);
    }
    step(1, 4, `Node.js v${process.versions.node} ✅`);

    // ── 2. Download or update ──
    if (existsSync(join(INSTALL_DIR, 'package.json'))) {
        step(2, 4, 'Nipun AI found — using existing installation.');
        log(c.dim(`   Location: ${INSTALL_DIR}`));
    } else {
        step(2, 4, 'Downloading Nipun AI...');

        const zipPath = join(homedir(), 'nipun-ai-download.zip');

        try {
            await download(ZIP_URL, zipPath);
        } catch (err) {
            log(c.red(`❌ Download failed: ${err.message}`));
            log(`   Check your internet connection and try again.`);
            process.exit(1);
        }

        // Extract ZIP
        log('   📦 Extracting...');
        try {
            if (platform() === 'win32') {
                execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${homedir()}' -Force"`, { stdio: 'pipe' });
            } else {
                execSync(`unzip -qo "${zipPath}" -d "${homedir()}"`, { stdio: 'pipe' });
            }

            // GitHub ZIPs extract to Nipun-AI-main/ — rename to nipun-ai/
            const extractedDir = join(homedir(), 'Nipun-AI-main');
            if (existsSync(extractedDir)) {
                if (existsSync(INSTALL_DIR)) {
                    // Remove old install
                    execSync(platform() === 'win32'
                        ? `rmdir /s /q "${INSTALL_DIR}"`
                        : `rm -rf "${INSTALL_DIR}"`,
                        { stdio: 'pipe' });
                }
                renameSync(extractedDir, INSTALL_DIR);
            }

            // Clean up ZIP
            unlinkSync(zipPath);
        } catch (err) {
            log(c.red(`❌ Extraction failed: ${err.message}`));
            log('   Make sure "unzip" is installed (macOS/Linux) or try again.');
            process.exit(1);
        }

        log(c.green('   ✅ Downloaded to ~/nipun-ai/'));
    }

    // ── 3. Install dependencies ──
    step(3, 4, 'Installing dependencies (first run takes ~60s)...');

    log('   📦 Worker...');
    if (!run('npm install --silent', join(INSTALL_DIR, 'worker'))) {
        // Try without --silent for better error messages
        log(c.yellow('   Retrying worker install...'));
        if (!run('npm install', join(INSTALL_DIR, 'worker'))) {
            log(c.red('❌ Worker dependency install failed.'));
            process.exit(1);
        }
    }

    log('   📦 Frontend...');
    if (!run('npm install --silent', join(INSTALL_DIR, 'frontend'))) {
        log(c.yellow('   Retrying frontend install...'));
        if (!run('npm install', join(INSTALL_DIR, 'frontend'))) {
            log(c.red('❌ Frontend dependency install failed.'));
            process.exit(1);
        }
    }

    log(c.green('   ✅ All dependencies ready.'));

    // ── 4. Start services ──
    step(4, 4, 'Starting Nipun AI...');
    log('');

    // Kill existing processes on these ports
    killPort(8787);
    killPort(5173);

    // Start worker
    const workerDir = join(INSTALL_DIR, 'worker');
    const worker = spawn('npx', ['wrangler', 'dev', '--port', '8787'], {
        cwd: workerDir,
        stdio: 'ignore',
        shell: true,
        detached: false,
    });

    // Give worker a moment to bind
    await new Promise((r) => setTimeout(r, 3000));

    // Start frontend
    const frontendDir = join(INSTALL_DIR, 'frontend');
    const frontend = spawn('npx', ['vite', '--port', '5173'], {
        cwd: frontendDir,
        stdio: 'ignore',
        shell: true,
        detached: false,
    });

    // Wait for frontend to be ready
    await new Promise((r) => setTimeout(r, 2000));

    // Open browser
    openBrowser('http://localhost:5173');

    // Print status
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log(c.green('✅ Nipun AI is running!'));
    log('');
    log(`   🌐 App:    ${c.cyan('http://localhost:5173')}`);
    log(`   ⚙️  Worker: ${c.cyan('http://localhost:8787')}`);
    log('');
    log(c.yellow('   Next steps:'));
    log('   1. Click "Demo Mode" to try instantly (no setup needed)');
    log('   2. Or enter free API keys for live data:');
    log(`      • Finnhub:  ${c.dim('https://finnhub.io')}`);
    log(`      • Gemini:   ${c.dim('https://aistudio.google.com')}`);
    log(`      • Groq:     ${c.dim('https://console.groq.com')}`);
    log(`      • Cohere:   ${c.dim('https://dashboard.cohere.com')}`);
    log(`      • Cerebras: ${c.dim('https://cloud.cerebras.ai')} (optional)`);
    log('');
    log(`   Press ${c.bold('Ctrl+C')} to stop.`);
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('');

    // Handle Ctrl+C gracefully
    const cleanup = () => {
        log('');
        log(c.yellow('Stopping Nipun AI...'));
        try { worker.kill(); } catch { /* */ }
        try { frontend.kill(); } catch { /* */ }
        killPort(8787);
        killPort(5173);
        log(c.green('✅ Stopped. Run `npx nipun-ai` to start again.'));
        process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    // Keep alive
    await new Promise(() => {});
}

main().catch((err) => {
    log(c.red(`\n❌ Fatal error: ${err.message}`));
    process.exit(1);
});
