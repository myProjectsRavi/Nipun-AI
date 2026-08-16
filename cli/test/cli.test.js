import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
    findAvailablePort,
    isReleaseReady,
    managedRoot,
    releaseArchiveUrl,
    releaseInstallDir,
    releaseTagForVersion,
} from '../lib/cli.js';

test('release tag is derived from the npm package version', () => {
    assert.equal(releaseTagForVersion('2.0.0'), 'v2.0.0');
    assert.equal(releaseTagForVersion('2.1.0-rc.1'), 'v2.1.0-rc.1');
    assert.throws(() => releaseTagForVersion('../main'));
});

test('release archive URL is HTTPS and points to an immutable version tag', () => {
    assert.equal(
        releaseArchiveUrl('2.0.0'),
        'https://github.com/myProjectsRavi/Nipun-AI/archive/refs/tags/v2.0.0.tar.gz',
    );
});

test('managed install paths never reuse the legacy ~/nipun-ai checkout', () => {
    assert.equal(managedRoot('/home/example'), '/home/example/.nipun-ai');
    assert.equal(releaseInstallDir('2.0.0', '/home/example'), '/home/example/.nipun-ai/releases/2.0.0');
});

test('release readiness requires a matching marker and lockfile digests', () => {
    const home = mkdtempSync(join(tmpdir(), 'nipun-ai-test-home-'));
    const installDir = releaseInstallDir('2.0.0', home);
    mkdirSync(join(installDir, 'worker'), { recursive: true });
    mkdirSync(join(installDir, 'frontend'), { recursive: true });
    writeFileSync(join(installDir, 'worker', 'package-lock.json'), '{"lockfileVersion":3}\n');
    writeFileSync(join(installDir, 'frontend', 'package-lock.json'), '{"lockfileVersion":3}\n');
    assert.equal(isReleaseReady(installDir, '2.0.0'), false);
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
