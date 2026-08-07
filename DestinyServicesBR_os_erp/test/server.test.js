const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const projectDir = path.join(__dirname, '..');
const dataFile = path.join(projectDir, 'data', 'db.json');

function waitForServer(url, timeout = 5000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryRequest = () => {
      const http = require('node:http');
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error('server did not start'));
          return;
        }
        setTimeout(tryRequest, 100);
      });
    };
    tryRequest();
  });
}

test('persiste clientes entre reinicializações do servidor', async () => {
  fs.rmSync(dataFile, { force: true });

  const child = spawn(process.execPath, ['server.js'], {
    cwd: projectDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: '3123' }
  });

  let stderr = '';
  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer('http://127.0.0.1:3123/api/ping');

    const createReq = await fetch('http://127.0.0.1:3123/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: 'Persistido', email: 'persistido@test.com' })
    });

    assert.equal(createReq.status, 201);

    const persisted = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    assert.ok(Array.isArray(persisted.clientes));
    assert.ok(persisted.clientes.some((cliente) => cliente.nome === 'Persistido'));
  } finally {
    child.kill('SIGTERM');
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  if (stderr) {
    console.error(stderr);
  }
});
