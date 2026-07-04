<div align="center">

# ⚡ GitHub Profile Toolkit

**Automate your GitHub profile README — zero runtime dependencies, idempotent updates, composable actions.**

[![CI](https://github.com/Kromilla/github-profile-toolkit/actions/workflows/validate.yml/badge.svg)](https://github.com/Kromilla/github-profile-toolkit/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node ≥ 20](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](package.json)
[![GitHub stars](https://img.shields.io/github/stars/Kromilla/github-profile-toolkit?style=social)](https://github.com/Kromilla/github-profile-toolkit/stargazers)

<br/>

> Most profile automation breaks in one of three ways: hardcoded scripts, fragile README edits, or workflows that commit even when nothing changed.  
> This toolkit solves all three.

</div>

---

## What it looks like

Your profile README stays fresh automatically. Here's a sample of what the toolkit generates:

**Recent Activity section** — updated daily, no manual editing needed:
```
- Pushed 3 commits to my-org/backend-service
- Opened pull request in my-org/bot-platform
- Created repository my-org/new-project
- Released v2.1.0 in my-org/cli-tool
- Starred awesome-dev/great-library
```

**Top Repositories table** — sorted by priority, stars, and freshness:

| Repository | Description | Stack | Metrics |
| :--- | :--- | :---: | :---: |
| [backend-service](https://github.com) | Production API for multi-tenant workloads | `TypeScript` | 142 stars / 18 forks |
| [bot-platform](https://github.com) | Extensible bot framework with plugin support | `Node.js` | 89 stars / 11 forks |
| [cli-tool](https://github.com) | Developer productivity CLI | `Go` | 54 stars / 6 forks |

---

## Why this toolkit

| Feature | github-profile-toolkit | Generic scripts | README widgets |
|---|:---:|:---:|:---:|
| Zero runtime dependencies | ✅ | ❌ | ✅ |
| Commits only on change | ✅ | ❌ | ✅ |
| Marker-based (partial updates) | ✅ | ❌ | ❌ |
| Composable — adopt one action at a time | ✅ | ❌ | ❌ |
| Custom script support | ✅ | ✅ | ❌ |
| Works with private repos | ✅ | Varies | ❌ |
| Self-hosted & auditable | ✅ | ✅ | ❌ |

---

## Quick start

### 1. Add section markers to your profile README

```md
## Recent Activity

<!--START_SECTION:activity-->
- Waiting for first workflow run
<!--END_SECTION:activity-->

## Top Repositories

<!--START_SECTION:top-repos-->
| Repository | Description | Stack | Metrics |
| :--- | :--- | :---: | :---: |
| Waiting for first workflow run | - | - | - |
<!--END_SECTION:top-repos-->
```

> **Tip:** Copy the full [sample profile README](examples/sample-readme.md) to get started instantly.

### 2. Create a workflow in your profile repository

```yaml
# .github/workflows/update-profile.yml
name: Update Profile README

on:
  schedule:
    - cron: "0 6 * * *"   # runs every day at 06:00 UTC
  workflow_dispatch:       # allows manual runs from the Actions tab

permissions:
  contents: write

jobs:
  update-activity:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Kromilla/github-profile-toolkit/actions/update-activity@main

  update-top-repos:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Kromilla/github-profile-toolkit/actions/update-top-repos@main
        with:
          exclude-repos: ${{ github.repository }}
          priority-repos: "project-a,project-b"
```

> See [`examples/workflows/`](examples/workflows/) for a minimal setup and a full-featured version with all four actions.

### 3. Run the workflow manually once

Open the **Actions** tab → select **Update Profile README** → click **Run workflow**.  
Your README will receive a commit only if the content actually changed.

---

## Available actions

| Action | Purpose |
| --- | --- |
| [`actions/update-activity`](actions/update-activity/action.yml) | Writes recent public GitHub events into a marked README section |
| [`actions/update-top-repos`](actions/update-top-repos/action.yml) | Builds a repository table with description, language, stars, and forks |
| [`actions/update-stats`](actions/update-stats/action.yml) | Generates stats, language, and streak SVG cards |
| [`actions/profile-section-updater`](actions/profile-section-updater/action.yml) | Runs any compatible Node.js updater script and commits on change |

---

## Action reference

### `actions/update-activity`

Fetches your latest public events from the GitHub API and writes them into your README.

```yaml
- uses: Kromilla/github-profile-toolkit/actions/update-activity@main
  with:
    readme-path: README.md          # default
    max-events: "5"                 # how many events to show
    start-marker: "<!--START_SECTION:activity-->"
    end-marker: "<!--END_SECTION:activity-->"
    commit-message: "chore(profile): update recent activity"
    token: ${{ secrets.GITHUB_TOKEN }}
```

Supported event types: `PushEvent`, `PullRequestEvent`, `IssuesEvent`, `IssueCommentEvent`, `CreateEvent`, `WatchEvent`, `ReleaseEvent`.

---

### `actions/update-top-repos`

Fetches your public repositories, applies priority ordering, and renders a Markdown table.

```yaml
- uses: Kromilla/github-profile-toolkit/actions/update-top-repos@main
  with:
    readme-path: README.md
    max-repos: "6"
    exclude-repos: ${{ github.repository }}   # always exclude the profile repo itself
    priority-repos: "backend-service,bot-platform"
    fallback-descriptions: '{"backend-service":"Production API for multi-tenant workloads."}'
    token: ${{ secrets.GITHUB_TOKEN }}
```

Repository ranking order:

1. **Priority list** — repos you explicitly pin first
2. **Star count** — descending
3. **Description availability** — repos with descriptions rank higher
4. **Last push date** — most recently active wins

---

### `actions/update-stats`

Generates stats, top languages, and streak SVG cards using [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) and [github-readme-streak-stats](https://github.com/DenverCoder1/github-readme-streak-stats).

```yaml
- uses: Kromilla/github-profile-toolkit/actions/update-stats@main
  with:
    stats-path: profile/stats.svg
    top-langs-path: profile/top-langs.svg
    streak-path: profile/streak.svg
    theme: tokyonight
```

---

### `actions/profile-section-updater`

Run your own custom updater script using the same idempotent commit logic as the built-in actions.

```yaml
- uses: Kromilla/github-profile-toolkit/actions/profile-section-updater@main
  with:
    script: scripts/my-custom-updater.js
    commit-message: "chore(profile): refresh custom section"
    token: ${{ secrets.GITHUB_TOKEN }}
```

Your script must call `updateReadmeSection` from `./lib/readmeSection` and exit with a non-zero code on failure.

---

## Repository layout

```text
github-profile-toolkit/
├── actions/
│   ├── update-activity/       # action.yml — recent GitHub events
│   ├── update-top-repos/      # action.yml — repository table
│   ├── update-stats/          # action.yml — SVG stats cards
│   └── profile-section-updater/  # action.yml — custom script runner
├── scripts/
│   ├── updateActivity.js
│   ├── updateTopRepos.js
│   └── lib/
│       ├── githubApi.js       # fetch helpers with auth support
│       └── readmeSection.js   # marker-based read/write/compare
├── examples/
│   ├── sample-readme.md       # full profile README template
│   └── workflows/
│       ├── minimal.yml        # single-action quick setup
│       ├── full-featured.yml  # all four actions in one workflow
│       └── profile-readme.yml # schedule + dispatch example
└── .github/workflows/
    └── validate.yml           # CI — syntax check on every push
```

---

## Design principles

### Marker-driven updates

Each updater targets only the content between explicit HTML comment markers. Everything else in your README is never touched.

### Commit only on change

Scripts compare the generated section against the current one before writing anything. Empty commits never appear in your repository history.

### Composable adoption

Enable one action today, add others next week. There is no monolithic setup step and no required configuration file.

### Token-aware API access

All actions accept a `token` input and default to `github.token`. Authenticated requests increase the API rate limit from 60 to 5,000 requests per hour and allow access to private repository metadata.

---

## Local development

Run a syntax check across all scripts:

```bash
npm run validate
```

Run a script locally against your profile repository:

```bash
GITHUB_USERNAME=your-username \
README_PATH=examples/sample-readme.md \
node scripts/updateActivity.js
```

```bash
GITHUB_USERNAME=your-username \
README_PATH=examples/sample-readme.md \
PRIORITY_REPOS=backend-service,bot-platform \
node scripts/updateTopRepos.js
```

---

## Roadmap

- [ ] Blog and release feed updater
- [ ] Pinned repository metrics action
- [ ] Config file support for multi-section updates in one run
- [ ] Published major version tags (`v1`, `v2`)

---

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for guidelines.  
Keep changes focused, documented, and consistent with the marker-based update model.

---

## Recent Activity (Author)
<!-- recent-activity:start -->
- 💪 Pushed 1 commit to [Kromilla/github-profile-toolkit](https://github.com/Kromilla/github-profile-toolkit)
- 🎉 Opened PR in [Kromilla/Kromilla](https://github.com/Kromilla/Kromilla)
- 💪 Pushed 1 commit to [Kromilla/universal-downloader](https://github.com/Kromilla/universal-downloader)
<!-- recent-activity:end -->

---

## License

[MIT](LICENSE)
