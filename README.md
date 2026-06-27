# GitHub Profile Toolkit

Reusable GitHub Actions and Node.js scripts for maintaining dynamic profile README files without brittle copy-paste automation.

Most profile automation breaks for one of three reasons: hardcoded scripts, fragile README edits, or workflows that commit even when nothing changed. This toolkit focuses on predictable section markers, idempotent updates, and composable actions you can adopt one piece at a time.

## Why this exists

Profile README repositories are a useful surface for developers, but they are painful to maintain manually. External widgets help, yet many teams still need:

- Recent activity that stays current
- Repository tables with live stars and forks
- Stats cards generated on a schedule
- Automation that only commits when content actually changes

GitHub Profile Toolkit packages those workflows into actions you can reference directly from your profile repository.

## Features

- Section-based README updates using HTML comment markers
- Idempotent scripts that skip commits when output is unchanged
- Dedicated actions for activity, top repositories, and stats cards
- Generic action for custom updater scripts
- Zero runtime dependencies beyond Node.js 20+
- Example workflows and README template included

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

### 2. Create a workflow in your profile repository

```yaml
name: Update Profile README

on:
  schedule:
    - cron: "0 6 * * *"
  workflow_dispatch:

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

### 3. Run the workflow manually once

Open Actions, run the workflow, and verify that your README receives a commit only when content changes.

## Available actions

| Action | Purpose |
| --- | --- |
| `actions/update-activity` | Writes recent public GitHub events into a marked README section |
| `actions/update-top-repos` | Builds a repository table with description, language, stars, and forks |
| `actions/update-stats` | Generates stats, language, and streak SVG cards |
| `actions/profile-section-updater` | Runs any compatible Node.js updater script and commits on change |

## Action reference

### `actions/update-activity`

```yaml
- uses: Kromilla/github-profile-toolkit/actions/update-activity@main
  with:
    readme-path: README.md
    max-events: "5"
    start-marker: "<!--START_SECTION:activity-->"
    end-marker: "<!--END_SECTION:activity-->"
    commit-message: "chore(profile): update recent activity"
```

Supported event types include pushes, pull requests, issues, repository creation, stars, and releases.

### `actions/update-top-repos`

```yaml
- uses: Kromilla/github-profile-toolkit/actions/update-top-repos@main
  with:
    readme-path: README.md
    max-repos: "6"
    exclude-repos: ${{ github.repository }}
    priority-repos: "backend-service,bot-platform"
    fallback-descriptions: '{"backend-service":"Production API for multi-tenant workloads."}'
```

Repository ranking uses this order:

1. Priority list
2. Star count
3. Description availability
4. Last push date

### `actions/update-stats`

```yaml
- uses: Kromilla/github-profile-toolkit/actions/update-stats@main
  with:
    stats-path: profile/stats.svg
    top-langs-path: profile/top-langs.svg
    streak-path: profile/streak.svg
    theme: tokyonight
```

### `actions/profile-section-updater`

Use this action when you want to run your own script with the same commit logic:

```yaml
- uses: Kromilla/github-profile-toolkit/actions/profile-section-updater@main
  with:
    script: scripts/my-custom-updater.js
    commit-message: "chore(profile): refresh custom section"
```

## Repository layout

```text
github-profile-toolkit/
├── actions/
│   ├── update-activity/
│   ├── update-top-repos/
│   ├── update-stats/
│   └── profile-section-updater/
├── scripts/
│   ├── updateActivity.js
│   ├── updateTopRepos.js
│   └── lib/
├── examples/
│   ├── sample-readme.md
│   └── workflows/profile-readme.yml
└── .github/workflows/validate.yml
```

## Design principles

### Marker-driven updates

Each updater replaces only the content between explicit start and end markers. The rest of your README remains untouched.

### Commit only on change

Scripts compare the generated section with the current section before writing. Workflows avoid empty commits and reduce repository noise.

### Composable adoption

You can enable one action today and add others later. No monolithic setup is required.

### Token-aware API access

Actions accept a `token` input and default to `github.token`. Authenticated requests are recommended for higher rate limits and private repository metadata when applicable.

## Local development

```bash
npm run validate

GITHUB_USERNAME=your-username \
README_PATH=examples/sample-readme.md \
node scripts/updateActivity.js
```

## Roadmap

- Blog and release feed updater
- Pinned repository metrics action
- Config file support for multi-section updates in one run
- Published major version tags (`v1`, `v2`)

## Contributing

Issues and pull requests are welcome. Keep changes focused, documented, and consistent with the marker-based update model.

## License

MIT
