import { describe, it, expect, afterAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// 2.0.0 (2026-10-14) : la note de la stable doit partir telle quelle au clic sur « Stable Release »,
// sans retouche du corps. Le récit de la version (`.github/release-highlights/<version>.md`) ouvre
// la note ; ses captures sont des fichiers du dépôt, jamais un emplacement vide publié.
const SCRIPTS = resolve(__dirname, '../../scripts');

const dirs: string[] = [];
afterAll(() => dirs.forEach(d => rmSync(d, { recursive: true, force: true })));

/** A throwaway repo: stable tag 1.0.0, then one product commit; package.json at 1.1.0-beta.2. */
function makeRepo(files: Record<string, string> = {}) {
  const repo = mkdtempSync(join(tmpdir(), 'ld-highlights-'));
  dirs.push(repo);
  const git = (...args: string[]) =>
    execFileSync('git', ['-c', 'user.name=s4piens', '-c', 'user.email=269597313+s4piens@users.noreply.github.com', ...args], {
      cwd: repo,
      encoding: 'utf8',
    }).trim();
  git('init', '-q');
  mkdirSync(join(repo, 'scripts'));
  mkdirSync(join(repo, 'src'));
  for (const f of ['generate-release-notes.sh', 'release-contributors.sh'])
    copyFileSync(join(SCRIPTS, f), join(repo, 'scripts', f));
  writeFileSync(join(repo, 'package.json'), JSON.stringify({ version: '1.1.0-beta.2' }, null, 2));
  writeFileSync(join(repo, '.gitignore'), 'RELEASE_NOTES.md\n');
  git('add', '-A');
  git('commit', '-q', '-m', 'chore: base');
  git('tag', '1.0.0');
  writeFileSync(join(repo, 'src', 'a.ts'), 'export const a = 1;\n');
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(join(repo, path, '..'), { recursive: true });
    writeFileSync(join(repo, path), content);
  }
  git('add', '-A');
  git('commit', '-q', '-m', 'feat: group entities for every area');
  const head = git('rev-parse', 'HEAD');
  const run = (tag?: string) => {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      GITHUB_API: 'file:///nonexistent',
      GITHUB_REPOSITORY: 'o/r',
      GH_TOKEN: '',
      GITHUB_TOKEN: '',
    };
    if (tag === undefined) delete env.TAG;
    else env.TAG = tag;
    return execFileSync('bash', [join(repo, 'scripts', 'generate-release-notes.sh'), '--ci', '--since-stable'], {
      cwd: repo,
      encoding: 'utf8',
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  };
  const notes = (tag?: string) => {
    run(tag);
    return readFileSync(join(repo, 'RELEASE_NOTES.md'), 'utf8');
  };
  return { repo, head, run, notes };
}

const STORY = '## 🎉 Control every room in one move\n\n![Room group](images/release/1.1.0/area.png)\n';

describe('stable release note — highlights of the version', () => {
  it('the highlights of the target version open the note, before the full changelog', () => {
    const { notes, head } = makeRepo({
      '.github/release-highlights/1.1.0.md': STORY,
      'images/release/1.1.0/area.png': 'png',
    });
    const n = notes('1.1.0');
    expect(n.startsWith('## 🎉 Control every room in one move\n')).toBe(true);
    expect(n).toContain(`![Room group](https://raw.githubusercontent.com/o/r/${head}/images/release/1.1.0/area.png)`);
    expect(n.indexOf('---')).toBeLessThan(n.indexOf('## 🇬🇧 English'));
    expect(n).toContain('- group entities for every area');
  });

  it('without TAG, the version comes from package.json without its pre-release suffix', () => {
    const { notes } = makeRepo({
      '.github/release-highlights/1.1.0.md': STORY,
      'images/release/1.1.0/area.png': 'png',
    });
    expect(notes().startsWith('## 🎉 Control every room in one move\n')).toBe(true);
  });

  it('a missing screenshot fails the run: a placeholder is never published', () => {
    const { run } = makeRepo({ '.github/release-highlights/1.1.0.md': STORY });
    expect(() => run('1.1.0')).toThrow(/Missing screenshot\(s\).*images\/release\/1\.1\.0\/area\.png/s);
  });

  it('an image in any other form fails the run: it would be published as a broken link', () => {
    for (const bad of [
      '![t](images/release/1.1.0/area.png "Title")',
      '![t](./images/release/1.1.0/area.png)',
      '![t](images/release/../../package.json)',
      '![t](images/release/1.1.0/*.png)',
      '<img src="images/release/1.1.0/area.png">',
      '![t](docs/area.png)',
      '![t][shot]\n\n[shot]: images/release/1.1.0/area.png',
      '![t][]\n\n[t]: images/release/1.1.0/area.png',
      '![t]\n\n[t]: images/release/1.1.0/area.png',
    ]) {
      const { run } = makeRepo({
        '.github/release-highlights/1.1.0.md': `## Story\n\n${bad}\n`,
        'images/release/1.1.0/area.png': 'png',
      });
      expect(() => run('1.1.0'), bad).toThrow(/Unsupported image reference/);
    }
  });

  it('a screenshot on disk but not committed fails the run: the URL points at HEAD', () => {
    const { run, repo } = makeRepo({ '.github/release-highlights/1.1.0.md': STORY });
    mkdirSync(join(repo, 'images/release/1.1.0'), { recursive: true });
    writeFileSync(join(repo, 'images/release/1.1.0/area.png'), 'png');
    expect(() => run('1.1.0')).toThrow(/not committed in HEAD/);
  });

  it('highlights without image, then the full changelog under its own heading', () => {
    const { notes } = makeRepo({ '.github/release-highlights/1.1.0.md': '## 🎉 Big news\n' });
    const n = notes('1.1.0');
    expect(n.startsWith('## 🎉 Big news\n\n---\n\n# 📋 All changes since 1.0.0 · Tous les changements depuis 1.0.0\n\n## 🇬🇧 English\n')).toBe(true);
  });

  it('highlights of another version, or none: the note is unchanged', () => {
    const { notes } = makeRepo({ '.github/release-highlights/9.9.9.md': STORY });
    const n = notes('1.1.0');
    expect(n).not.toContain('Control every room');
    expect(n.startsWith('## 🇬🇧 English\n')).toBe(true);
  });
});
