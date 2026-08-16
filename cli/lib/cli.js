import { createHash, randomUUID } from 'crypto';
import { createWriteStream } from 'fs';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'fs';
import https from 'https';
import net from 'net';
import { homedir, platform } from 'os';
import { join, resolve, sep } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync, spawn } from 'child_process';

const REPOSITORY = 'myProjectsRavi/Nipun-AI';
const RELEASE_HOSTS = new Set(['github.com', 'codeload.github.com']);
const MAX_ARCHIVE_BYTES = 250 * 1024 * 1024;
const DEFAULT_WORKER_PORT = 8787;
const DEFAULT_FRONTEND_PORT = 5173;
const PORT_SCAN_LIMIT = 20;
const STARTUP_TIMEOUT_MS = 45_000;
const INSTALL_MARKER = '.nipun-ai-install.json';
const INSTALL_LOCK_OWNER = 'owner.json';
const INSTALL_LOCK_TIMEOUT_MS = 10 * 60 * 1000;
const INSTALL_LOCK_POLL_MS = 200;
const INSTALL_LOCK_OWNER_GRACE_MS = 5_000;
const PACKAGE_PATH = fileURLToPath(new URL('../package.json', import.meta.url));
const PACKAGE = JSON.parse(readFileSync(PACKAGE_PATH, 'utf8'));
const CLI_VERSION = PACKAGE.version;

const colors = process.stdout.isTTY
    ? {
          green: (value) => `\x1b[32m${value}\x1b[0m`,
          yellow: (value) => `\x1b[33m${value}\x1b[0m`,
          cyan: (value) => `\x1b[36m${value}\x1b[0m`,
          red: (value) => `\x1b[31m${value}\x1b[0m`,
          bold: (value) => `\x1b[1m${value}\x1b[0m`,
          dim: (value) => `\x1b[2m${value}\x1b[0m`,
      }
    : {
          green: String,
          yellow: String,
          cyan: String,
          red: String,
          bold: String,
          dim: String,
      };

export function releaseTagForVersion(version = CLI_VERSION) {
    if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
        throw new Error(`Invalid package version: ${version}`);
    }
    return `v${version}`;
}

export function releaseArchiveUrl(version = CLI_VERSION) {
    return `https://github.com/${REPOSITORY}/archive/refs/tags/${releaseTagForVersion(version)}.tar.gz`;
}

export function managedRoot(home = homedir()) {
    return join(home, '.nipun-ai');
}

export function releaseInstallDir(version = CLI_VERSION, home = homedir()) {
    return join(managedRoot(home), 'releases', version);
}

function log(message = '') {
    console.log(message);
}

function step(number, total, message) {
    log(`${colors.yellow(`[${number}/${total}]`)} ${message}`);
}

function delay(ms) {
    return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function commandExists(command) {
    const spec = commandSpec(command, ['--version']);
    try {
        execFileSync(spec.command, spec.args, { stdio: 'ignore', windowsHide: true });
        return true;
    } catch {
        return false;
    }
}

function commandSpec(command, args = []) {
    if (platform() === 'win32' && (command === 'npm' || command === 'npx')) {
        return {
            command: process.env.ComSpec || 'cmd.exe',
            args: ['/d', '/s', '/c', `${command}.cmd`, ...args],
        };
    }
    return { command, args };
}

function runChecked(command, args, cwd, { quiet = true } = {}) {
    const spec = commandSpec(command, args);
    try {
        execFileSync(spec.command, spec.args, {
            cwd,
            env: process.env,
            stdio: quiet ? 'pipe' : 'inherit',
            windowsHide: true,
            maxBuffer: 16 * 1024 * 1024,
        });
        return { ok: true, output: '' };
    } catch (error) {
        const stderr = error?.stderr ? String(error.stderr) : '';
        const stdout = error?.stdout ? String(error.stdout) : '';
        return { ok: false, output: `${stdout}\n${stderr}`.trim() };
    }
}

function assertInsideManagedRoot(targetPath, home = homedir()) {
    const root = resolve(managedRoot(home));
    const target = resolve(targetPath);
    if (target === root || !target.startsWith(`${root}${sep}`)) {
        throw new Error(`Refusing to modify path outside ${root}`);
    }
}

function safeRemove(targetPath, home = homedir()) {
    if (!existsSync(targetPath)) return;
    assertInsideManagedRoot(targetPath, home);
    rmSync(targetPath, { recursive: true, force: true });
}

function readInstallLockOwner(lockDir) {
    try {
        return JSON.parse(readFileSync(join(lockDir, INSTALL_LOCK_OWNER), 'utf8'));
    } catch {
        return null;
    }
}

function processExists(pid) {
    if (!Number.isInteger(pid) || pid <= 0) return false;
    try {
        process.kill(pid, 0);
        return true;
    } catch (error) {
        if (error?.code === 'EPERM') return true;
        if (error?.code === 'ESRCH') return false;
        return true;
    }
}

function removeAbandonedInstallLock(lockDir, home) {
    if (!existsSync(lockDir)) return true;

    const owner = readInstallLockOwner(lockDir);
    if (owner && Number.isInteger(owner.pid) && owner.pid > 0) {
        if (processExists(owner.pid)) return false;
        safeRemove(lockDir, home);
        return true;
    }

    try {
        if (Date.now() - statSync(lockDir).mtimeMs < INSTALL_LOCK_OWNER_GRACE_MS) return false;
    } catch {
        return true;
    }

    safeRemove(lockDir, home);
    return true;
}

async function acquireInstallLock({
    version = CLI_VERSION,
    home = homedir(),
    timeoutMs = INSTALL_LOCK_TIMEOUT_MS,
    pollMs = INSTALL_LOCK_POLL_MS,
} = {}) {
    releaseTagForVersion(version);
    const root = managedRoot(home);
    const locksDir = join(root, 'locks');
    const lockDir = join(locksDir, version);
    mkdirSync(locksDir, { recursive: true, mode: 0o700 });
    const deadline = Date.now() + timeoutMs;

    while (true) {
        try {
            mkdirSync(lockDir, { mode: 0o700 });
            const owner = {
                token: randomUUID(),
                pid: process.pid,
                createdAt: new Date().toISOString(),
            };
            const ownerPath = join(lockDir, INSTALL_LOCK_OWNER);
            try {
                writeFileSync(ownerPath, `${JSON.stringify(owner, null, 2)}\n`, { mode: 0o600 });
                try {
                    chmodSync(ownerPath, 0o600);
                } catch {
                    // Windows ACLs are managed by the OS; chmod may be a no-op.
                }
            } catch (error) {
                safeRemove(lockDir, home);
                throw error;
            }

            let released = false;
            return () => {
                if (released) return;
                released = true;
                const currentOwner = readInstallLockOwner(lockDir);
                if (currentOwner?.token === owner.token) safeRemove(lockDir, home);
            };
        } catch (error) {
            if (error?.code !== 'EEXIST') throw error;
        }

        if (removeAbandonedInstallLock(lockDir, home)) continue;
        if (Date.now() >= deadline) {
            throw new Error(`Timed out waiting for another ${releaseTagForVersion(version)} installation to finish. Retry the command.`);
        }
        await delay(pollMs);
    }
}

function cleanupVersionStaging(root, version, home) {
    const prefix = `.install-${version}-`;
    for (const name of readdirSync(root)) {
        if (name.startsWith(prefix)) safeRemove(join(root, name), home);
    }
}

function sha256File(path) {
    return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function installationMarkerPath(installDir) {
    return join(installDir, INSTALL_MARKER);
}

export function isReleaseReady(installDir, version = CLI_VERSION) {
    try {
        const workerLock = join(installDir, 'worker', 'package-lock.json');
        const frontendLock = join(installDir, 'frontend', 'package-lock.json');
        const marker = JSON.parse(readFileSync(installationMarkerPath(installDir), 'utf8'));
        return (
            marker.version === version &&
            marker.releaseTag === releaseTagForVersion(version) &&
            marker.nodeMajor === Number(process.versions.node.split('.')[0]) &&
            marker.platform === platform() &&
            marker.arch === process.arch &&
            existsSync(join(installDir, 'worker', 'node_modules')) &&
            existsSync(join(installDir, 'frontend', 'node_modules')) &&
            marker.workerLockSha256 === sha256File(workerLock) &&
            marker.frontendLockSha256 === sha256File(frontendLock)
        );
    } catch {
        return false;
    }
}

function writeInstallationMarker(installDir, version = CLI_VERSION) {
    const marker = {
        version,
        releaseTag: releaseTagForVersion(version),
        nodeMajor: Number(process.versions.node.split('.')[0]),
        platform: platform(),
        arch: process.arch,
        workerLockSha256: sha256File(join(installDir, 'worker', 'package-lock.json')),
        frontendLockSha256: sha256File(join(installDir, 'frontend', 'package-lock.json')),
        installedAt: new Date().toISOString(),
    };
    const markerPath = installationMarkerPath(installDir);
    writeFileSync(markerPath, `${JSON.stringify(marker, null, 2)}\n`, { mode: 0o600 });
    try {
        chmodSync(markerPath, 0o600);
    } catch {
        // Windows ACLs are managed by the OS; chmod may be a no-op.
    }
}

function download(url, destination, redirectsRemaining = 5) {
    return new Promise((resolvePromise, rejectPromise) => {
        const parsed = new URL(url);
        if (parsed.protocol !== 'https:' || !RELEASE_HOSTS.has(parsed.hostname)) {
            rejectPromise(new Error(`Blocked unexpected download host: ${parsed.hostname}`));
            return;
        }

        const request = https.get(parsed, { headers: { 'User-Agent': `nipun-ai/${CLI_VERSION}` } }, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                response.resume();
                if (redirectsRemaining <= 0) {
                    rejectPromise(new Error('Too many redirects while downloading Nipun AI'));
                    return;
                }
                const redirected = new URL(response.headers.location, parsed).toString();
                download(redirected, destination, redirectsRemaining - 1).then(resolvePromise, rejectPromise);
                return;
            }

            if (response.statusCode !== 200) {
                response.resume();
                rejectPromise(new Error(`Release download failed with HTTP ${response.statusCode}`));
                return;
            }

            const announcedSize = Number(response.headers['content-length'] || 0);
            if (announcedSize > MAX_ARCHIVE_BYTES) {
                response.resume();
                rejectPromise(new Error('Release archive is unexpectedly large'));
                return;
            }

            let received = 0;
            const file = createWriteStream(destination, { mode: 0o600 });
            const fail = (error) => {
                response.destroy();
                file.destroy();
                try {
                    rmSync(destination, { force: true });
                } catch {
                    // Best effort cleanup only.
                }
                rejectPromise(error);
            };

            response.on('data', (chunk) => {
                received += chunk.length;
                if (received > MAX_ARCHIVE_BYTES) {
                    fail(new Error('Release archive exceeded the maximum allowed size'));
                }
            });
            response.on('error', fail);
            file.on('error', fail);
            file.on('finish', () => file.close(resolvePromise));
            response.pipe(file);
        });
        request.setTimeout(30_000, () => request.destroy(new Error('Release download timed out')));
        request.on('error', rejectPromise);
    });
}

function findExtractedRepository(extractRoot) {
    const candidates = readdirSync(extractRoot)
        .map((name) => join(extractRoot, name))
        .filter((path) => statSync(path).isDirectory())
        .filter((path) => existsSync(join(path, 'worker', 'package-lock.json')))
        .filter((path) => existsSync(join(path, 'frontend', 'package-lock.json')));

    if (candidates.length !== 1) {
        throw new Error('Downloaded release did not contain exactly one Nipun AI repository');
    }
    return candidates[0];
}

async function stageReleaseWithArchive(tempRoot, version) {
    if (!commandExists('tar')) return null;

    const archive = join(tempRoot, 'release.tar.gz');
    const extractRoot = join(tempRoot, 'extract');
    mkdirSync(extractRoot, { recursive: true });

    await download(releaseArchiveUrl(version), archive);
    const extracted = runChecked('tar', ['-xzf', archive, '-C', extractRoot], tempRoot);
    if (!extracted.ok) return null;
    return findExtractedRepository(extractRoot);
}

function stageReleaseWithGit(tempRoot, version) {
    if (!commandExists('git')) return null;
    const destination = join(tempRoot, 'repo');
    const result = runChecked(
        'git',
        [
            'clone',
            '--depth',
            '1',
            '--single-branch',
            '--branch',
            releaseTagForVersion(version),
            `https://github.com/${REPOSITORY}.git`,
            destination,
        ],
        tempRoot,
    );
    return result.ok ? destination : null;
}

async function stageRelease(tempRoot, version) {
    try {
        const fromArchive = await stageReleaseWithArchive(tempRoot, version);
        if (fromArchive) return fromArchive;
    } catch {
        // Fall back to git below. The final error remains concise and actionable.
    }

    const fromGit = stageReleaseWithGit(tempRoot, version);
    if (fromGit) return fromGit;
    throw new Error(`Could not download immutable release ${releaseTagForVersion(version)} from GitHub`);
}

function installDependencies(installDir) {
    const npm = 'npm';
    const targets = [
        ['Worker', join(installDir, 'worker')],
        ['Frontend', join(installDir, 'frontend')],
    ];

    for (const [label, cwd] of targets) {
        log(`   📦 ${label}...`);
        const result = runChecked(npm, ['ci', '--no-fund'], cwd);
        if (!result.ok) {
            const detail = result.output ? `\n${tail(result.output)}` : '';
            throw new Error(`${label} dependency installation failed.${detail}`);
        }
    }
}

async function ensureReleaseInstalledWith({
    version = CLI_VERSION,
    home = homedir(),
    stageReleaseFn = stageRelease,
    installDependenciesFn = installDependencies,
    lockPollMs = INSTALL_LOCK_POLL_MS,
} = {}) {
    const root = managedRoot(home);
    const releasesDir = join(root, 'releases');
    const installDir = releaseInstallDir(version, home);
    mkdirSync(releasesDir, { recursive: true, mode: 0o700 });

    if (isReleaseReady(installDir, version)) {
        return { installDir, installed: false };
    }

    const releaseLock = await acquireInstallLock({ version, home, pollMs: lockPollMs });
    let tempRoot;
    try {
        if (isReleaseReady(installDir, version)) {
            return { installDir, installed: false };
        }

        if (existsSync(installDir)) {
            safeRemove(installDir, home);
        }

        cleanupVersionStaging(root, version, home);
        tempRoot = mkdtempSync(join(root, `.install-${version}-`));
        const staged = await stageReleaseFn(tempRoot, version);
        const tempRootResolved = resolve(tempRoot);
        const stagedResolved = resolve(staged);
        if (stagedResolved === tempRootResolved || !stagedResolved.startsWith(`${tempRootResolved}${sep}`)) {
            throw new Error('Refusing to install a staged release from outside the managed staging directory');
        }

        await installDependenciesFn(staged);
        writeInstallationMarker(staged, version);
        if (!isReleaseReady(staged, version)) {
            throw new Error(`Staged release ${releaseTagForVersion(version)} failed verification`);
        }

        if (existsSync(installDir)) {
            safeRemove(installDir, home);
        }
        renameSync(staged, installDir);
        return { installDir, installed: true };
    } finally {
        try {
            if (tempRoot && existsSync(tempRoot)) safeRemove(tempRoot, home);
        } finally {
            releaseLock();
        }
    }
}

export async function ensureReleaseInstalled({ version = CLI_VERSION, home = homedir() } = {}) {
    return ensureReleaseInstalledWith({ version, home });
}

function canListen(port, host = '127.0.0.1') {
    return new Promise((resolvePromise) => {
        const server = net.createServer();
        server.unref();
        server.once('error', () => resolvePromise(false));
        server.listen({ port, host, exclusive: true }, () => {
            server.close(() => resolvePromise(true));
        });
    });
}

export async function findAvailablePort(startPort, { attempts = PORT_SCAN_LIMIT } = {}) {
    for (let offset = 0; offset < attempts; offset += 1) {
        const port = startPort + offset;
        if (await canListen(port)) return port;
    }
    throw new Error(`No free local port found in range ${startPort}-${startPort + attempts - 1}`);
}

function captureProcess(command, args, options) {
    const child = spawn(command, args, {
        ...options,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    const append = (chunk) => {
        output = `${output}${String(chunk)}`;
        if (output.length > 64 * 1024) output = output.slice(-64 * 1024);
    };
    child.stdout?.on('data', append);
    child.stderr?.on('data', append);
    return { child, output: () => output };
}

function spawnNpx(args, options) {
    const spec = commandSpec('npx', args);
    return captureProcess(spec.command, spec.args, {
        ...options,
        detached: platform() !== 'win32',
        shell: false,
    });
}

async function waitForHttp(url, processInfo, timeoutMs = STARTUP_TIMEOUT_MS) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        if (processInfo.child.exitCode !== null) {
            throw new Error(`Process exited before becoming ready.\n${tail(processInfo.output())}`);
        }
        try {
            const response = await fetch(url, { signal: AbortSignal.timeout(1_500) });
            if (response.status < 500) return;
        } catch {
            // Not ready yet.
        }
        await delay(350);
    }
    throw new Error(`Timed out waiting for ${url}.\n${tail(processInfo.output())}`);
}

function tail(value, maxLines = 24) {
    return value.split(/\r?\n/).filter(Boolean).slice(-maxLines).join('\n');
}

function terminate(child) {
    if (!child || child.exitCode !== null) return;
    try {
        if (platform() === 'win32') {
            execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
                stdio: 'ignore',
                windowsHide: true,
            });
        } else {
            process.kill(-child.pid, 'SIGTERM');
        }
    } catch {
        try {
            child.kill('SIGTERM');
        } catch {
            // Best effort; process may already be gone.
        }
    }
}

function openBrowser(url) {
    try {
        let child;
        if (platform() === 'darwin') {
            child = spawn('open', [url], { detached: true, stdio: 'ignore' });
        } else if (platform() === 'win32') {
            child = spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'start', '', url], {
                detached: true,
                stdio: 'ignore',
                windowsHide: true,
            });
        } else {
            child = spawn('xdg-open', [url], { detached: true, stdio: 'ignore' });
        }
        child.unref();
    } catch {
        // Browser opening is convenience only; the printed URL is authoritative.
    }
}

function ensureSupportedNode() {
    const major = Number(process.versions.node.split('.')[0]);
    if (!Number.isInteger(major) || major < 22) {
        throw new Error(`Node.js 22+ is required. Current runtime: v${process.versions.node}`);
    }
}

async function printDoctor() {
    const workerPortFree = await canListen(DEFAULT_WORKER_PORT);
    const frontendPortFree = await canListen(DEFAULT_FRONTEND_PORT);
    const installDir = releaseInstallDir();
    const checks = [
        ['CLI version', CLI_VERSION],
        ['Node.js', `v${process.versions.node} ${Number(process.versions.node.split('.')[0]) >= 22 ? '✅' : '❌'}`],
        ['npm', commandExists('npm') ? 'available ✅' : 'missing ❌'],
        ['tar', commandExists('tar') ? 'available ✅' : 'not found (git fallback will be used)'],
        ['git', commandExists('git') ? 'available ✅' : 'not found'],
        [`Port ${DEFAULT_WORKER_PORT}`, workerPortFree ? 'available ✅' : 'busy (a free alternative will be selected)'],
        [`Port ${DEFAULT_FRONTEND_PORT}`, frontendPortFree ? 'available ✅' : 'busy (a free alternative will be selected)'],
        ['Cached release', isReleaseReady(installDir) ? `${installDir} ✅` : 'not installed yet'],
        ['Release source', `${releaseTagForVersion()} → ${releaseArchiveUrl()}`],
    ];
    log(`Nipun AI diagnostics (${platform()})`);
    for (const [name, value] of checks) log(`- ${name}: ${value}`);
}

function printHelp() {
    log(
        `Nipun AI ${CLI_VERSION}\n\nUsage:\n  npx nipun-ai@latest\n  npx nipun-ai@latest --doctor\n  npx nipun-ai@latest --version\n\nThe CLI installs the exact matching GitHub release under ~/.nipun-ai/releases/ and reuses it on later launches.`,
    );
}

export async function runCli(argv = process.argv.slice(2)) {
    const smokeTest = argv.length === 1 && argv[0] === '--smoke-test' && process.env.CI === 'true';
    if (argv.includes('--version') || argv.includes('-v')) {
        log(CLI_VERSION);
        return;
    }
    if (argv.includes('--help') || argv.includes('-h')) {
        printHelp();
        return;
    }
    if (argv.includes('--doctor')) {
        await printDoctor();
        return;
    }
    if (argv.length > 0 && !smokeTest) {
        throw new Error(`Unknown option: ${argv[0]}. Run with --help for supported options.`);
    }

    ensureSupportedNode();
    log('');
    log(colors.cyan('🧠 Nipun AI — The Open-Source Bloomberg Alternative'));
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('');
    step(1, 4, `Node.js v${process.versions.node} ✅`);

    const installDir = releaseInstallDir();
    const readyBefore = isReleaseReady(installDir);
    step(
        2,
        4,
        readyBefore ? `Verified cached release ${releaseTagForVersion()} ✅` : `Installing immutable release ${releaseTagForVersion()}...`,
    );
    const installation = await ensureReleaseInstalled();
    if (installation.installed) log(colors.green(`   ✅ Installed ${releaseTagForVersion()} to ${installation.installDir}`));
    else log(colors.dim(`   Reusing ${installation.installDir}`));

    step(
        3,
        4,
        installation.installed
            ? 'Dependencies installed from lockfiles with npm ci ✅'
            : 'Dependencies already verified — skipping reinstall ✅',
    );

    const workerPort = await findAvailablePort(DEFAULT_WORKER_PORT);
    const frontendPort = await findAvailablePort(DEFAULT_FRONTEND_PORT);
    const workerUrl = `http://localhost:${workerPort}`;
    const frontendUrl = `http://localhost:${frontendPort}`;

    step(4, 4, 'Starting local services...');
    const worker = spawnNpx(
        ['wrangler', 'dev', '--port', String(workerPort), '--var', `ALLOWED_ORIGINS:${frontendUrl},https://nipun-ai.pages.dev`],
        {
            cwd: join(installation.installDir, 'worker'),
            env: process.env,
        },
    );

    let frontend;
    const cleanup = () => {
        terminate(frontend?.child);
        terminate(worker.child);
    };

    process.once('SIGINT', () => {
        cleanup();
        log(`\n${colors.green('✅ Stopped Nipun AI.')}`);
        process.exit(0);
    });
    process.once('SIGTERM', () => {
        cleanup();
        process.exit(0);
    });

    try {
        await waitForHttp(`${workerUrl}/health`, worker);
        frontend = spawnNpx(['vite', '--host', '127.0.0.1', '--port', String(frontendPort), '--strictPort'], {
            cwd: join(installation.installDir, 'frontend'),
            env: { ...process.env, VITE_WORKER_URL: workerUrl },
        });
        await waitForHttp(frontendUrl, frontend);
    } catch (error) {
        cleanup();
        throw error;
    }

    if (smokeTest) {
        cleanup();
        log(colors.green('✅ End-to-end CLI smoke test passed.'));
        return;
    }

    openBrowser(frontendUrl);
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log(colors.green('✅ Nipun AI is running!'));
    log(`   🌐 App:    ${colors.cyan(frontendUrl)}`);
    log(`   ⚙️  Worker: ${colors.cyan(workerUrl)}`);
    if (workerPort !== DEFAULT_WORKER_PORT || frontendPort !== DEFAULT_FRONTEND_PORT) {
        log(colors.dim('   Default ports were busy, so safe free ports were selected automatically.'));
    }
    log('');
    log(`   Press ${colors.bold('Ctrl+C')} to stop.`);
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await Promise.race([
        new Promise((resolvePromise) => worker.child.once('exit', resolvePromise)),
        new Promise((resolvePromise) => frontend.child.once('exit', resolvePromise)),
    ]);

    const failureOutput = tail(`${worker.output()}\n${frontend.output()}`);
    cleanup();
    throw new Error(`A local Nipun AI service stopped unexpectedly.${failureOutput ? `\n${failureOutput}` : ''}`);
}

export const internals = Object.freeze({
    CLI_VERSION,
    DEFAULT_WORKER_PORT,
    DEFAULT_FRONTEND_PORT,
    acquireInstallLock,
    ensureReleaseInstalledWith,
});
