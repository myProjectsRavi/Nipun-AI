import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
    findAvailablePort,
    internals,
    isReleaseReady,
    managedRoot,
    releaseArchiveUrl,
    releaseInstallDir,
    releaseTagForVersion,
} from '../lib/cli.js';

const CLI_BIN = fileURLToPath(new URL('../bin/nipun-ai.js', import.meta.url));

test('release tag is derived from the npm package version', () => {
    assert.equal(releaseTagForVersion('2.0.0'), 'v2.0.0');
    assert.equal(releaseTagForVersion('2.1.0-rc.1'), 'v2.1.0-rc.1');
    assert.throws(() => releaseTagForVersion('../main'));
});

test('release archive URL is HTTPS and points to an immutable version tag', () => {
    assert.equal(releaseArchiveUrl('2.0.0'), 'https://github.com/myProjectsRavi/Nipun-AI/archive/refs/tags/v2.0.0.tar.gz');
});

test('managed install paths never reuse the legacy ~/nipun-ai checkout', () => {
    const home = join('example-home');
    assert.equal(managedRoot(home), join(home, '.nipun-ai'));
    assert.equal(releaseInstallDir('2.0.0', home), join(home, '.nipun-ai', 'releases', '2.0.0'));
});

test('release readiness requires a matching marker and lockfile digests', () => {
    const home = mkdtempSync(join(tmpdir(), 'nipun-ai-test-home-'));
    const installDir = releaseInstallDir('2.0.0', home);
    mkdirSync(join(installDir, 'worker'), { recursive: true });
    mkdirSync(join(installDir, 'frontend'), { recursive: true });
    writeFileSync(join(installDir, 'worker', 'package-lock.json'), '{"lockfileVersion":3}\n');
    writeFileSync(join(installDir, 'frontend', 'package-lock.json'), '{"lockfileVersion":3}\n');
    assert.equal(isReleaseReady(installDir, '2.0.0'), false);
    rmSync(home, { recursive: true, force: true });
});

test('concurrent first installs serialize and never expose or delete a partial release', async () => {
    const home = mkdtempSync(join(tmpdir(), 'nipun-ai-concurrent-home-'));
    const version = '2.0.0';
    const finalDir = releaseInstallDir(version, home);
    let stageCalls = 0;
    let installCalls = 0;
    let finalVisibleDuringInstall = false;

    const stageReleaseFn = async (tempRoot) => {
        stageCalls += 1;
        const staged = join(tempRoot, 'repo');
        mkdirSync(join(staged, 'worker'), { recursive: true });
        mkdirSync(join(staged, 'frontend'), { recursive: true });
        writeFileSync(join(staged, 'worker', 'package-lock.json'), '{"lockfileVersion":3}\n');
        writeFileSync(join(staged, 'frontend', 'package-lock.json'), '{"lockfileVersion":3}\n');
        return staged;
    };

    const installDependenciesFn = async (staged) => {
        installCalls += 1;
        finalVisibleDuringInstall ||= existsSync(finalDir);
        await new Promise((resolve) => setTimeout(resolve, 80));
        assert.equal(existsSync(join(staged, 'worker', 'package-lock.json')), true);
        assert.equal(existsSync(join(staged, 'frontend', 'package-lock.json')), true);
        mkdirSync(join(staged, 'worker', 'node_modules'), { recursive: true });
        mkdirSync(join(staged, 'frontend', 'node_modules'), { recursive: true });
    };

    const options = {
        version,
        home,
        stageReleaseFn,
        installDependenciesFn,
        lockPollMs: 10,
    };

    const first = internals.ensureReleaseInstalledWith(options);
    await new Promise((resolve) => setTimeout(resolve, 10));
    const second = internals.ensureReleaseInstalledWith(options);
    const results = await Promise.all([first, second]);

    assert.equal(stageCalls, 1);
    assert.equal(installCalls, 1);
    assert.equal(finalVisibleDuringInstall, false);
    assert.deepEqual(
        results.map((result) => result.installed).sort(),
        [false, true],
    );
    assert.equal(isReleaseReady(finalDir, version), true);
    assert.equal(
        readdirSync(managedRoot(home)).some((name) => name.startsWith(`.install-${version}-`)),
        false,
    );
    rmSync(home, { recursive: true, force: true });
});

test('findAvailablePort skips an occupied port without terminating its owner', async () => {
    const net = await import('node:net');
    const server = net.createServer();
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const occupied = server.address().port;
    const selected = await findAvailablePort(occupied, { attempts: 3 });
    assert.notEqual(selected, occupied);
    assert.equal(server.listening, true);
    await new Promise((resolve) => server.close(resolve));
});

test('--doctor never echoes arbitrary secret-like environment values', () => {
    const sentinel = 'NIPUN_TEST_SECRET_DO_NOT_PRINT_7d7f7dbf';
    const output = execFileSync(process.execPath, [CLI_BIN, '--doctor'], {
        encoding: 'utf8',
        env: { ...process.env, NIPUN_TEST_SECRET: sentinel },
    });
    assert.equal(output.includes(sentinel), false);
});
