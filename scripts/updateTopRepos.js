const path = require('path');
const { updateReadmeSection } = require('./lib/readmeSection');
const { fetchUserRepositories } = require('./lib/githubApi');

const USERNAME = process.env.GITHUB_USERNAME || process.env.GITHUB_REPOSITORY_OWNER;
const README_PATH = process.env.README_PATH || 'README.md';
const MAX_REPOS = Number(process.env.MAX_REPOS || 6);
const START_MARKER = process.env.START_MARKER || '<!--START_SECTION:top-repos-->';
const END_MARKER = process.env.END_MARKER || '<!--END_SECTION:top-repos-->';

const EXCLUDE_REPOS = new Set(
  (process.env.EXCLUDE_REPOS || '')
    .split(',')
    .map((repo) => repo.trim())
    .filter(Boolean)
);

const PRIORITY_REPOS = (process.env.PRIORITY_REPOS || '')
  .split(',')
  .map((repo) => repo.trim())
  .filter(Boolean);

const FALLBACK_DESCRIPTIONS = parseJsonEnv('FALLBACK_DESCRIPTIONS', {});

function parseJsonEnv(name, fallback) {
  if (!process.env[name]) return fallback;

  try {
    return JSON.parse(process.env[name]);
  } catch {
    throw new Error(`${name} must be valid JSON.`);
  }
}

function getDescription(repo) {
  return repo.description || FALLBACK_DESCRIPTIONS[repo.name] || 'No description provided.';
}

function formatLanguage(language) {
  return language || 'Other';
}

function sortRepositories(repositories) {
  return repositories.sort((a, b) => {
    const aPriority = PRIORITY_REPOS.indexOf(a.name);
    const bPriority = PRIORITY_REPOS.indexOf(b.name);
    const aRank = aPriority === -1 ? Number.MAX_SAFE_INTEGER : aPriority;
    const bRank = bPriority === -1 ? Number.MAX_SAFE_INTEGER : bPriority;

    if (aRank !== bRank) return aRank - bRank;
    if (b.stargazers_count !== a.stargazers_count) {
      return b.stargazers_count - a.stargazers_count;
    }

    const aHasDescription = Boolean(a.description);
    const bHasDescription = Boolean(b.description);
    if (aHasDescription !== bHasDescription) {
      return Number(bHasDescription) - Number(aHasDescription);
    }

    return new Date(b.pushed_at) - new Date(a.pushed_at);
  });
}

function buildTopReposSection(repositories) {
  const rows = repositories.map((repo) => {
    const description = getDescription(repo).replace(/\|/g, '\\|');
    const language = formatLanguage(repo.language);
    const stars = repo.stargazers_count.toLocaleString('en-US');
    const forks = repo.forks_count.toLocaleString('en-US');

    return `| [${repo.name}](${repo.html_url}) | ${description} | \`${language}\` | ${stars} stars / ${forks} forks |`;
  });

  return [
    '| Repository | Description | Stack | Metrics |',
    '| :--- | :--- | :---: | :---: |',
    ...rows,
  ].join('\n');
}

async function main() {
  if (!USERNAME) {
    throw new Error('GITHUB_USERNAME or GITHUB_REPOSITORY_OWNER is required.');
  }

  const repositories = sortRepositories(
    (await fetchUserRepositories(USERNAME, process.env.GITHUB_TOKEN)).filter(
      (repo) => !repo.fork && !repo.private && !EXCLUDE_REPOS.has(repo.full_name)
    )
  ).slice(0, MAX_REPOS);

  if (!repositories.length) {
    console.log('No repositories found to publish.');
    return;
  }

  const sectionBody = buildTopReposSection(repositories);
  const result = updateReadmeSection({
    readmePath: path.resolve(README_PATH),
    startMarker: START_MARKER,
    endMarker: END_MARKER,
    sectionBody,
  });

  if (result.changed) {
    console.log(`Top repositories section updated with ${repositories.length} entries.`);
  } else {
    console.log('Top repositories section unchanged.');
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
