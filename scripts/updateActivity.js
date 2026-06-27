const path = require('path');
const { updateReadmeSection } = require('./lib/readmeSection');
const { fetchUserEvents } = require('./lib/githubApi');

const USERNAME = process.env.GITHUB_USERNAME || process.env.GITHUB_REPOSITORY_OWNER;
const README_PATH = process.env.README_PATH || 'README.md';
const MAX_EVENTS = Number(process.env.MAX_EVENTS || 5);
const START_MARKER = process.env.START_MARKER || '<!--START_SECTION:activity-->';
const END_MARKER = process.env.END_MARKER || '<!--END_SECTION:activity-->';

function formatEvent(event) {
  const repoName = event.repo.name;
  const repoUrl = `https://github.com/${repoName}`;

  switch (event.type) {
    case 'PushEvent': {
      const commitCount =
        event.payload.size ||
        event.payload.distinct_size ||
        (event.payload.commits && event.payload.commits.length) ||
        1;
      const commitLabel = commitCount === 1 ? 'commit' : 'commits';
      return `Pushed ${commitCount} ${commitLabel} to [${repoName}](${repoUrl})`;
    }
    case 'PullRequestEvent':
      return `${capitalize(event.payload.action)} pull request in [${repoName}](${repoUrl})`;
    case 'IssuesEvent':
      return `${capitalize(event.payload.action)} issue in [${repoName}](${repoUrl})`;
    case 'IssueCommentEvent':
      return `Commented on issue in [${repoName}](${repoUrl})`;
    case 'CreateEvent':
      if (event.payload.ref_type === 'repository') {
        return `Created repository [${repoName}](${repoUrl})`;
      }
      return `Created ${event.payload.ref_type} in [${repoName}](${repoUrl})`;
    case 'WatchEvent':
      return `Starred [${repoName}](${repoUrl})`;
    case 'ReleaseEvent':
      return `Published release in [${repoName}](${repoUrl})`;
    default:
      return null;
  }
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildActivitySection(events) {
  const lines = [];
  const seenRepos = new Set();

  for (const event of events) {
    if (seenRepos.has(event.repo.name)) continue;

    const formatted = formatEvent(event);
    if (!formatted) continue;

    lines.push(`- ${formatted}`);
    seenRepos.add(event.repo.name);

    if (lines.length >= MAX_EVENTS) break;
  }

  return lines.length ? lines.join('\n') : null;
}

async function main() {
  if (!USERNAME) {
    throw new Error('GITHUB_USERNAME or GITHUB_REPOSITORY_OWNER is required.');
  }

  const events = await fetchUserEvents(USERNAME, process.env.GITHUB_TOKEN);
  const sectionBody = buildActivitySection(events);

  if (!sectionBody) {
    console.log('No activity found to publish.');
    return;
  }

  const result = updateReadmeSection({
    readmePath: path.resolve(README_PATH),
    startMarker: START_MARKER,
    endMarker: END_MARKER,
    sectionBody,
  });

  if (result.changed) {
    console.log('Activity section updated.');
  } else {
    console.log('Activity section unchanged.');
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
