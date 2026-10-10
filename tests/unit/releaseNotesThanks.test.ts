import { describe, it, expect, afterAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// 2.0.0-beta.4 (2026-10-10) : la PR #175 de @renetruelsen n'était créditée nulle part ailleurs
// que dans « Contributors ». Toute note (beta comme stable) qui embarque une PR d'un contributeur
// externe doit le remercier en tête et créditer ses lignes « by @compte ».
const SCRIPTS = resolve(__dirname, '../../scripts');
const THANKS_SENTENCE = 'This release includes contributions from the community — thank you!';

interface Commit {
  name: string;
  email: string;
  msg: string;
  login?: string | null;
  prAuthor?: string;
}

const MAINTAINER: Commit = {
  name: 's4piens',
  email: '269597313+s4piens@users.noreply.github.com',
  msg: 'feat: add the thing',
};
const JUICY: Commit = {
  name: 'Juicy',
  email: 'julien.decoen.pro@gmail.com',
  msg: 'fix: repair the other thing',
  login: 'Julien-Decoen',
};
const BOT: Commit = {
  name: 'github-actions[bot]',
  email: '41898282+github-actions[bot]@users.noreply.github.com',
  msg: 'chore: bump deps',
};
const RENE: Commit = {
  name: 'René Truelsen',
  email: '43169509+renetruelsen@users.noreply.github.com',
  msg: 'Fix brightness slider issues and area entity lookups (#175)',
};
// Email linked to no account: the merged PR says who it is (PR #152 is @flatline-84, not @flatline84).
const FLAT: Commit = {
  name: 'flatline84',
  email: 'peterkydas@github.com',
  msg: 'fix(sensor): restore aggregate sensors',
  prAuthor: 'flatline-84',
};
const JANE: Commit = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  msg: 'fix: area lookups on empty floors (#180)',
  login: 'janedoe',
};

const dirs: string[] = [];
afterAll(() => dirs.forEach(d => rmSync(d, { recursive: true, force: true })));

/** A throwaway repo: stable tag 1.0.0, then one commit per entry, each touching src/. */
function makeRepo(commits: Commit[]) {
  const repo = mkdtempSync(join(tmpdir(), 'ld-notes-'));
  const api = mkdtempSync(join(tmpdir(), 'ld-notes-api-'));
  dirs.push(repo, api);
  const git = (...args: string[]) =>
    execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim();
  git('init', '-q');
  mkdirSync(join(repo, 'scripts'));
  mkdirSync(join(repo, 'src'));
  for (const f of ['generate-release-notes.sh', 'release-contributors.sh'])
    copyFileSync(join(SCRIPTS, f), join(repo, 'scripts', f));
  writeFileSync(join(repo, 'package.json'), JSON.stringify({ version: '1.0.1-beta.1' }));
  writeFileSync(join(repo, '.gitignore'), 'RELEASE_NOTES.md\n');
  git('add', '-A');
  git(
    '-c',
    'user.name=Base',
    '-c',
    'user.email=base@example.com',
    'commit',
    '-q',
    '-m',
    'chore: base'
  );
  git('tag', '1.0.0');
  const shas: string[] = [];
  commits.forEach((c, i) => {
    writeFileSync(join(repo, 'src', `f${i}.ts`), `export const v = ${i};\n`);
    git('add', '-A');
    git('-c', `user.name=${c.name}`, '-c', `user.email=${c.email}`, 'commit', '-q', '-m', c.msg);
    const sha = git('rev-parse', 'HEAD');
    shas.push(sha);
    if (c.login !== undefined) {
      const dir = join(api, 'repos', 'o', 'r', 'commits');
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, sha),
        JSON.stringify({ sha, author: c.login ? { login: c.login } : null })
      );
    }
    if (c.prAuthor) {
      const dir = join(api, 'repos', 'o', 'r', 'commits', sha);
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, 'pulls'),
        JSON.stringify([
          { number: 152, merged_at: '2026-07-16T21:58:37Z', user: { login: c.prAuthor } },
        ])
      );
    }
  });
  const notes = (...args: string[]) => {
    execFileSync('bash', [join(repo, 'scripts', 'generate-release-notes.sh'), '--ci', ...args], {
      cwd: repo,
      encoding: 'utf8',
      env: {
        ...process.env,
        GITHUB_API: `file://${api}`,
        GITHUB_REPOSITORY: 'o/r',
        GH_TOKEN: '',
        GITHUB_TOKEN: '',
      },
    });
    return readFileSync(join(repo, 'RELEASE_NOTES.md'), 'utf8');
  };
  const external = () =>
    execFileSync(
      'bash',
      [join(repo, 'scripts', 'release-contributors.sh'), '--external', '1.0.0..HEAD'],
      {
        cwd: repo,
        encoding: 'utf8',
        env: {
          ...process.env,
          GITHUB_API: `file://${api}`,
          GITHUB_REPOSITORY: 'o/r',
          GH_TOKEN: '',
          GITHUB_TOKEN: '',
        },
      }
    );
  return { repo, shas, notes, external };
}

const linesOf = (notes: string, needle: string) =>
  notes.split('\n').filter(l => l.includes(needle));

describe('release notes — thanking external contributors (beta)', () => {
  it('one external contributor: thanked under the title, credited on every line of their PR', () => {
    const notes = makeRepo([MAINTAINER, RENE, JUICY]).notes();
    expect(
      notes.startsWith(
        `# 🎉 Release Notes\n\n## 🙏 Thank you @renetruelsen\n\n${THANKS_SENTENCE}\n\n## 🇬🇧 English\n`
      )
    ).toBe(true);
    const rene = linesOf(notes, 'Fix brightness slider issues and area entity lookups (#175)');
    expect(rene.length).toBeGreaterThan(0);
    rene.forEach(l => expect(l).toMatch(/ by @renetruelsen$/));
    linesOf(notes, 'add the thing').forEach(l => expect(l).not.toContain(' by @'));
    linesOf(notes, 'repair the other thing').forEach(l => expect(l).not.toContain(' by @'));
    expect(notes).not.toContain('René Truelsen');
  });

  it('typed commit of an external contributor is credited in its section, EN and FR', () => {
    const notes = makeRepo([MAINTAINER, JANE]).notes();
    expect(linesOf(notes, '- area lookups on empty floors (#180) by @janedoe')).toHaveLength(2);
  });

  it('two external contributors: both thanked once, each line credited to its author', () => {
    const notes = makeRepo([
      RENE,
      MAINTAINER,
      JANE,
      { ...RENE, msg: 'fix: second fix (#181)' },
    ]).notes();
    expect(notes).toContain(`## 🙏 Thank you @janedoe, @renetruelsen\n\n${THANKS_SENTENCE}\n`);
    expect(notes.match(/🙏/g)).toHaveLength(1);
    linesOf(notes, 'area lookups on empty floors').forEach(l => expect(l).toMatch(/ by @janedoe$/));
    linesOf(notes, 'second fix').forEach(l => expect(l).toMatch(/ by @renetruelsen$/));
  });

  it('no external contributor (maintainers, bots): no thank-you block, no credit', () => {
    const notes = makeRepo([MAINTAINER, JUICY, BOT]).notes();
    expect(
      notes.startsWith(
        '# 🎉 Release Notes\n\n## 🇬🇧 English\n\n### ✨ New Features\n\n- add the thing\n\n'
      )
    ).toBe(true);
    expect(notes).not.toContain('🙏');
    expect(notes).not.toContain(' by @');
  });

  it('email linked to no account: thanked and credited as the author of the merged PR, never by git name', () => {
    const notes = makeRepo([MAINTAINER, FLAT]).notes();
    expect(notes).toContain('## 🙏 Thank you @flatline-84\n');
    expect(linesOf(notes, 'restore aggregate sensors').length).toBeGreaterThan(0);
    linesOf(notes, 'restore aggregate sensors').forEach(l =>
      expect(l).toMatch(/ by @flatline-84$/)
    );
    expect(notes).not.toContain('@flatline84');
  });

  it('account not resolved (API unreachable): nobody is mentioned at random', () => {
    const { repo } = makeRepo([MAINTAINER, JANE]);
    execFileSync('bash', [join(repo, 'scripts', 'generate-release-notes.sh'), '--ci'], {
      cwd: repo,
      encoding: 'utf8',
      env: {
        ...process.env,
        GITHUB_API: 'file:///nonexistent',
        GITHUB_REPOSITORY: 'o/r',
        GH_TOKEN: '',
        GITHUB_TOKEN: '',
      },
    });
    const notes = readFileSync(join(repo, 'RELEASE_NOTES.md'), 'utf8');
    expect(notes).not.toContain('🙏');
    expect(notes).not.toContain(' by @');
  });
});

describe('release notes — thanking external contributors (stable, --since-stable)', () => {
  it('external contributor: thank-you block first, line credited with the GitHub account', () => {
    const notes = makeRepo([MAINTAINER, RENE, JUICY]).notes('--since-stable');
    expect(
      notes.startsWith(`## 🙏 Thank you @renetruelsen\n\n${THANKS_SENTENCE}\n\n## 🇬🇧 English\n`)
    ).toBe(true);
    const rene = linesOf(notes, 'Fix brightness slider issues and area entity lookups');
    expect(rene).toHaveLength(2);
    rene.forEach(l =>
      expect(l).toMatch(/\(\[#175\]\(https:\/\/github\.com\/o\/r\/pull\/175\)\) by @renetruelsen$/)
    );
    expect(notes).not.toContain('— @');
  });

  it('two external contributors on a stable', () => {
    const notes = makeRepo([RENE, JANE]).notes('--since-stable');
    expect(
      notes.startsWith(`## 🙏 Thank you @janedoe, @renetruelsen\n\n${THANKS_SENTENCE}\n\n`)
    ).toBe(true);
    linesOf(notes, 'area lookups on empty floors').forEach(l => expect(l).toMatch(/ by @janedoe$/));
  });

  it('no external contributor: no block, and maintainers are never credited (not even by git name)', () => {
    const notes = makeRepo([
      MAINTAINER,
      JUICY,
      { ...JUICY, name: 'Julien-Decoen', msg: 'feat: other feature' },
      BOT,
    ]).notes('--since-stable');
    expect(notes.startsWith('## 🇬🇧 English\n\n### ✨ New Features\n\n')).toBe(true);
    expect(notes).not.toContain('🙏');
    expect(notes).not.toContain('@');
  });
});

describe('release-contributors.sh --external', () => {
  it('lists "<sha>\\t<login>" for external commits only (never maintainers or bots)', () => {
    const { shas, external } = makeRepo([MAINTAINER, RENE, JUICY, BOT, JANE]);
    const out = external().trim().split('\n').sort();
    expect(out).toEqual([`${shas[1]}\trenetruelsen`, `${shas[4]}\tjanedoe`].sort());
  });
});
