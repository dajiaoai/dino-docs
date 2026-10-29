import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const npm = 'npm';
const root = fileURLToPath(new URL('..', import.meta.url));
if (process.argv.includes('--uet')) process.env.DINO_UET_DEV = '1';
console.log(`Microsoft UET: ${process.env.DINO_UET_DEV === '1' ? 'enabled (187264185)' : 'disabled (enable with npm run dev:uet)'}`);
let stopping = false;

const commands = [
  {
    name: 'docs',
    command: npm,
    args: ['run', 'docs:dev', '--', '--port', '5173', '--strictPort'],
  },
  {
    name: 'question-bank demo',
    command: npm,
    args: [
      'run',
      'dev',
      '--workspace',
      '@dino-open/demo-question-bank',
      '--',
      '--host',
      '127.0.0.1',
      '--port',
      '5174',
      '--strictPort',
    ],
  },
  {
    name: 'smart-classroom demo',
    command: npm,
    args: [
      'run',
      'dev',
      '--workspace',
      '@dino-open/demo-smart-classroom',
      '--',
      '--host',
      '127.0.0.1',
      '--port',
      '5175',
      '--strictPort',
    ],
  },
];

const children = commands.map(({ name, command, args }) => {
  const child = spawn(command, args, {
    cwd: root,
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });
  child.on('exit', (code, signal) => {
    if (!stopping) {
      console.error(`${name} stopped unexpectedly (${signal ?? code}).`);
      shutdown(code ?? 1);
    }
  });
  return child;
});

function shutdown(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exit(exitCode);
}

process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());
