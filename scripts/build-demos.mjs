import { execFile } from 'node:child_process';
import { cp, mkdir, readdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = path.resolve(import.meta.dirname, '..');
const demosRoot = path.join(root, 'demos');
const outputRoot = path.join(root, 'docs/public/demos');

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
  await execFileAsync('npm', ['run', 'build', '--workspace', metadata.package], {
    cwd: root,
    stdio: 'inherit',
  });

  await cp(path.join(demoRoot, 'dist'), path.join(outputRoot, metadata.id), {
    recursive: true,
  });
}

console.log(`Demos copied to ${path.relative(root, outputRoot)}`);
