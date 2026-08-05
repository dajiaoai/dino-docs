import { spawn } from 'node:child_process';
import { cp, mkdir, readdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const demosRoot = path.join(root, 'demos');
const outputRoot = path.join(root, 'docs/public/demos');

function runNpm(args) {
  const npmExecPath = process.env.npm_execpath;
  const command = npmExecPath
    ? { executable: process.execPath, args: [npmExecPath, ...args] }
    : {
        executable: process.platform === 'win32' ? 'npm.cmd' : 'npm',
        args,
      };

  return new Promise((resolve, reject) => {
    const child = spawn(command.executable, command.args, {
      cwd: root,
      stdio: 'inherit',
    });

    child.once('error', reject);
    child.once('close', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      const reason = signal ? `signal ${signal}` : `exit code ${code}`;
      reject(new Error(`npm ${args.join(' ')} failed with ${reason}`));
    });
  });
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

const entries = await readdir(demosRoot, { withFileTypes: true });
for (const entry of entries.filter((item) => item.isDirectory())) {
  const demoRoot = path.join(demosRoot, entry.name);
  let metadata;

  try {
    metadata = JSON.parse(await readFile(path.join(demoRoot, 'demo.json'), 'utf8'));
  } catch {
    continue;
  }

  if (!metadata.enabled) continue;
  if (metadata.id !== entry.name) {
    throw new Error(`Demo 目录 ${entry.name} 与 demo.json id ${metadata.id} 不一致`);
  }

  console.log(`Building demo: ${metadata.id}`);
  await runNpm(['run', 'build', '--workspace', metadata.package]);

  await cp(path.join(demoRoot, 'dist'), path.join(outputRoot, metadata.id), {
    recursive: true,
  });
}

console.log(`Demos copied to ${path.relative(root, outputRoot)}`);
