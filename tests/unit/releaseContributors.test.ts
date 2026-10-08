import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// Release notes « Contributors » (2026-10-05) : le nom git « Juicy » donnait @Juicy, un autre
// compte GitHub que Julien-Decoen. Le script doit citer le COMPTE relié au commit, jamais le nom.
const SCRIPT = resolve(__dirname, '../../scripts/release-contributors.sh');

let repo: string;
let api: string;
const git = (...args: string[]) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim();
const commit = (name: string, email: string, msg: string) => {
  git('-c', `user.name=${name}`, '-c', `user.email=${email}`, 'commit', '-q', '--allow-empty', '-m', msg);
  return git('rev-parse', 'HEAD');
};
const loginFor = (sha: string, login: string | null) => {
  const dir = join(api, 'repos', 'o', 'r', 'commits');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, sha), JSON.stringify({ sha, author: login ? { login } : null }));
};
const run = (range: string) =>
  execFileSync('bash', [SCRIPT, range], {
    cwd: repo,
    encoding: 'utf8',
    env: { ...process.env, GITHUB_API: `file://${api}`, GITHUB_REPOSITORY: 'o/r', GH_TOKEN: '', GITHUB_TOKEN: '' },
  }).trim().split('\n');

describe('release-contributors.sh', () => {
  beforeAll(() => {
    repo = mkdtempSync(join(tmpdir(), 'ld-contrib-'));
    api = mkdtempSync(join(tmpdir(), 'ld-api-'));
    git('init', '-q');
    commit('Base', 'base@example.com', 'chore: base');
    git('tag', 'v0');
    loginFor(commit('Juicy', 'julien.decoen.pro@gmail.com', 'feat: a'), 'Julien-Decoen');
    loginFor(commit('Julien-Decoen', 'julien.decoen.pro@gmail.com', 'fix: b'), 'Julien-Decoen');
    commit('s4piens', '269597313+s4piens@users.noreply.github.com', 'feat: c');
    loginFor(commit('root', 'root@srv544245.hstgr.cloud', 'chore: d'), null);
  });
  afterAll(() => {
    rmSync(repo, { recursive: true, force: true });
    rmSync(api, { recursive: true, force: true });
  });

  it('cite le compte GitHub du commit, jamais le nom git', () => {
    const out = run('v0..HEAD');
    expect(out).toContain('- @Julien-Decoen');
    expect(out).not.toContain('- @Juicy');
  });

  it('un même compte n’apparaît qu’une fois', () => {
    expect(run('v0..HEAD').filter((l) => l === '- @Julien-Decoen')).toHaveLength(1);
  });

  it('lit le compte dans une adresse noreply sans appeler l’API', () => {
    expect(run('v0..HEAD')).toContain('- @s4piens');
  });

  it('sans compte relié, écrit le nom sans @ (ne mentionne personne au hasard)', () => {
    const out = run('v0..HEAD');
    expect(out).toContain('- root');
    expect(out).not.toContain('- @root');
  });

  it('API injoignable : noms sans @, jamais une mention inventée', () => {
    const out = execFileSync('bash', [SCRIPT, 'v0..HEAD'], {
      cwd: repo,
      encoding: 'utf8',
      env: { ...process.env, GITHUB_API: 'file:///nonexistent', GITHUB_REPOSITORY: 'o/r' },
    }).trim().split('\n');
    expect(out.filter((l) => l.startsWith('- @'))).toEqual(['- @s4piens']);
  });
});
