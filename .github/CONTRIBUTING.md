# Contributing to GitHub Profile Toolkit

Thank you for your interest in contributing! This is a small, focused project — contributions that keep it simple and composable are most welcome.

## What makes a good contribution

- **Bug fixes** — especially around README parsing edge cases or GitHub API changes
- **New event types** — additional `formatEvent` cases in `updateActivity.js`
- **New actions** — must follow the marker-based update pattern and commit only on change
- **Documentation** — clearer examples, better explanations, more workflow variants

## Ground rules

- Keep changes focused. One feature or fix per pull request.
- Match the existing code style (no linter config, just follow what's there).
- If adding a script, it must be runnable locally via environment variables.
- If adding an action, it must accept `token`, `readme-path`, and `commit-message` inputs.
- Do not introduce runtime dependencies. The zero-dependency constraint is intentional.

## Development setup

```bash
# Clone the repo
git clone https://github.com/Kromilla/github-profile-toolkit.git
cd github-profile-toolkit

# Check syntax on all scripts
npm run validate

# Run a script locally
GITHUB_USERNAME=your-username \
README_PATH=examples/sample-readme.md \
node scripts/updateActivity.js
```

## Submitting a pull request

1. Fork the repository and create a branch from `main`.
2. Make your changes and test them locally.
3. Open a pull request with a clear title and description of what changed and why.
4. Reference any related issue if applicable.

## Reporting bugs

Use the [bug report template](ISSUE_TEMPLATE/bug_report.md). Include the exact error message, the workflow step that failed, and any relevant environment details (Node version, OS).

## Requesting features

Use the [feature request template](ISSUE_TEMPLATE/feature_request.md). Describe the use case, not just the solution — it helps evaluate fit with the project's scope.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](../LICENSE).
