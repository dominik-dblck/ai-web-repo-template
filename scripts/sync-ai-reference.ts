/**
 * sync-ai-reference.ts
 *
 * Syncs AI-layer files from the `ai-reference` git remote.
 * Runs as a predev hook so the local repo stays up-to-date
 * with the latest skills, patterns, evaluations, commands,
 * knowledge base, and docs.
 *
 * Safe by design: always exits 0, never breaks the dev server.
 */

import { execSync } from 'child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'fs';
import { dirname, join } from 'path';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const REMOTE = 'ai-reference';
const REMOTE_BRANCH = 'main';

/** Directories synced recursively (trailing slash = directory). */
const SYNC_DIRS = [
  '.claude/skills/',
  '.claude/patterns/',
  '.claude/evaluations/',
  '.claude/commands/',
  'knowladge/',
];

/** Individual files synced as-is. */
const SYNC_FILES = ['docs/repo-structure.md'];

/** CLAUDE.md uses marker-based partial sync. */
const CLAUDE_MD = 'CLAUDE.md';
const SYNC_START = '<!-- SYNC:START -->';
const SYNC_END = '<!-- SYNC:END -->';

const ROOT = process.cwd();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(msg: string) {
  console.log(`[sync-ai-reference] ${msg}`);
}

function warn(msg: string) {
  console.warn(`[sync-ai-reference] WARNING: ${msg}`);
}

function git(args: string): string {
  return execSync(`git ${args}`, { cwd: ROOT, encoding: 'utf-8' }).trim();
}

/** Read a file from the remote ref. Returns null if the path doesn't exist. */
function gitShow(path: string): string | null {
  try {
    return execSync(`git show ${REMOTE}/${REMOTE_BRANCH}:${path}`, {
      cwd: ROOT,
      encoding: 'utf-8',
    });
  } catch {
    return null;
  }
}

/** List files under a directory in the remote ref. Returns [] on error. */
function gitLsTree(dir: string): string[] {
  try {
    const output = git(
      `ls-tree -r --name-only ${REMOTE}/${REMOTE_BRANCH} ${dir}`,
    );
    return output ? output.split('\n').filter(Boolean) : [];
  } catch {
    return [];
  }
}

function ensureDir(filePath: string) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

// ---------------------------------------------------------------------------
// Sync logic
// ---------------------------------------------------------------------------

type SyncResult = { updated: string[]; created: string[]; removed: string[] };

function syncFile(remotePath: string, result: SyncResult): void {
  const content = gitShow(remotePath);
  if (content === null) return; // file doesn't exist in remote

  if (!content.length) {
    warn(`${remotePath} is empty in remote, skipping`);
    return;
  }

  const localPath = join(ROOT, remotePath);
  const existed = existsSync(localPath);
  const currentContent = existed ? readFileSync(localPath, 'utf-8') : null;

  if (currentContent === content) return; // no change

  ensureDir(localPath);
  writeFileSync(localPath, content, 'utf-8');

  if (existed) {
    result.updated.push(remotePath);
  } else {
    result.created.push(remotePath);
  }
}

function syncDirectory(dir: string, result: SyncResult): void {
  const remoteFiles = gitLsTree(dir);
  const remoteSet = new Set(remoteFiles);

  // Sync each remote file to local
  for (const file of remoteFiles) {
    syncFile(file, result);
  }

  // Detect local files that were removed from remote
  const localDir = join(ROOT, dir);
  if (existsSync(localDir)) {
    const localFiles = listLocalFiles(localDir, dir);
    for (const localFile of localFiles) {
      if (!remoteSet.has(localFile)) {
        const localPath = join(ROOT, localFile);
        rmSync(localPath, { force: true });
        result.removed.push(localFile);
      }
    }
  }
}

/** Recursively list files under a local directory, returning repo-relative paths. */
function listLocalFiles(absDir: string, relativePrefix: string): string[] {
  // readdirSync and statSync imported at top level
  const files: string[] = [];
  try {
    for (const entry of readdirSync(absDir)) {
      const full = join(absDir, entry);
      const rel = relativePrefix + entry;
      if (statSync(full).isDirectory()) {
        files.push(...listLocalFiles(full, rel + '/'));
      } else {
        files.push(rel);
      }
    }
  } catch {
    // ignore read errors
  }
  return files;
}

function syncClaudeMd(result: SyncResult): void {
  const remoteContent = gitShow(CLAUDE_MD);
  if (remoteContent === null) return;

  const remoteStart = remoteContent.indexOf(SYNC_START);
  const remoteEnd = remoteContent.indexOf(SYNC_END);

  if (remoteStart === -1 || remoteEnd === -1) {
    warn('Remote CLAUDE.md missing SYNC:START/SYNC:END markers, skipping');
    return;
  }

  const managedSection = remoteContent.slice(
    remoteStart,
    remoteEnd + SYNC_END.length,
  );

  if (!managedSection.length) {
    warn('Remote CLAUDE.md managed section is empty, skipping');
    return;
  }

  const localPath = join(ROOT, CLAUDE_MD);

  if (!existsSync(localPath)) {
    // No local CLAUDE.md — write the full remote file
    ensureDir(localPath);
    writeFileSync(localPath, remoteContent, 'utf-8');
    result.created.push(CLAUDE_MD);
    return;
  }

  const localContent = readFileSync(localPath, 'utf-8');
  const localStart = localContent.indexOf(SYNC_START);
  const localEnd = localContent.indexOf(SYNC_END);

  if (localStart === -1 || localEnd === -1) {
    warn('Local CLAUDE.md missing SYNC:START/SYNC:END markers, skipping');
    return;
  }

  const newContent =
    localContent.slice(0, localStart) +
    managedSection +
    localContent.slice(localEnd + SYNC_END.length);

  if (newContent === localContent) return; // no change

  writeFileSync(localPath, newContent, 'utf-8');
  result.updated.push(CLAUDE_MD + ' (managed section)');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  // 1. Check remote exists
  try {
    execSync(`git remote get-url ${REMOTE}`, {
      cwd: ROOT,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch {
    log('ai-reference remote not configured, skipping sync');
    process.exit(0);
  }

  // 2. Fetch latest
  log('Fetching latest from ai-reference...');
  try {
    git(`fetch ${REMOTE} ${REMOTE_BRANCH} --quiet`);
  } catch (err) {
    warn(`Failed to fetch from ${REMOTE}: ${err}`);
    process.exit(0);
  }

  // 3. Sync
  const result: SyncResult = { updated: [], created: [], removed: [] };

  for (const dir of SYNC_DIRS) {
    syncDirectory(dir, result);
  }

  for (const file of SYNC_FILES) {
    syncFile(file, result);
  }

  syncClaudeMd(result);

  // 4. Summary
  const total =
    result.updated.length + result.created.length + result.removed.length;

  if (total === 0) {
    log('Everything up to date.');
  } else {
    if (result.created.length) log(`Created: ${result.created.join(', ')}`);
    if (result.updated.length) log(`Updated: ${result.updated.join(', ')}`);
    if (result.removed.length) log(`Removed: ${result.removed.join(', ')}`);
    log(`Synced ${total} file(s).`);
  }
}

try {
  main();
} catch (err) {
  warn(`Unexpected error: ${err}`);
}

process.exit(0);
