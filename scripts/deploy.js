// npm run deploy — обновить сервер до текущего origin/main и перезапустить контейнер.
//
// Сервер сам забирает код из GitHub (git pull) и собирает Docker-образ,
// поэтому выкладывается только то, что уже запушено.
// Куда выкладывать — в .env.deploy (в git не попадает, образец: .env.deploy.example).
// Переезд на другой сервер = поменять строки в .env.deploy и один раз подготовить сервер
// (git clone + .env, см. .env.example).

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import os from 'node:os';

const CONFIG_FILE = '.env.deploy';
if (existsSync(CONFIG_FILE)) process.loadEnvFile(CONFIG_FILE);

const { DEPLOY_SSH, DEPLOY_DIR = '~/autofaren', DEPLOY_KEY, DEPLOY_URL } = process.env;
if (!DEPLOY_SSH) {
  fail(`Не задан DEPLOY_SSH (user@host). Скопируйте .env.deploy.example в ${CONFIG_FILE} и заполните.`);
}

function fail(message) {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}

function git(...args) {
  const r = spawnSync('git', args, { encoding: 'utf8' });
  if (r.status !== 0) fail(`git ${args.join(' ')}: ${r.stderr.trim()}`);
  return r.stdout.trim();
}

// 1. Сервер берёт код из GitHub — проверяем, что всё нужное туда уже ушло.
git('fetch', '--quiet', 'origin', 'main');
const ahead = Number(git('rev-list', '--count', 'origin/main..HEAD'));
if (ahead > 0) fail(`Есть ${ahead} незапушенных коммитов — сначала git push.`);
if (git('status', '--porcelain')) {
  console.warn('⚠ Есть незакоммиченные изменения — на сервер они НЕ попадут.');
}
console.log(`→ Выкладываю ${git('log', '-1', '--format=%h %s', 'origin/main')}`);

// 2. На сервере: подтянуть код, пересобрать, дождаться healthcheck.
const remote = [
  'set -e',
  `cd ${DEPLOY_DIR}`,
  'git pull --ff-only --quiet',
  'docker compose up -d --build --remove-orphans --wait',
  'docker image prune -f >/dev/null',
  'echo "✔ На сервере: $(git log -1 --format="%h %s")"',
].join(' && ');

const sshArgs = ['-o', 'BatchMode=yes'];
if (DEPLOY_KEY) sshArgs.push('-i', DEPLOY_KEY.replace(/^~(?=[\\/])/, os.homedir()), '-o', 'IdentitiesOnly=yes');
sshArgs.push(DEPLOY_SSH, remote);

const r = spawnSync('ssh', sshArgs, { stdio: 'inherit' });
if (r.status !== 0) fail('Деплой не удался — вывод выше.');
if (DEPLOY_URL) console.log(`→ Открыть: ${DEPLOY_URL}`);
