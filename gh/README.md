# GitHub CLI Configuration

This directory contains configuration files for the [GitHub CLI](https://cli.github.com/) (`gh`), a command-line tool for interacting with GitHub repositories, issues, pull requests, and more.

## Files

- `config.yml` - Main configuration file with settings and aliases
- `hosts.yml` - Authentication and host-specific configuration

## Setup

If you're setting up on a new machine:

1. Install GitHub CLI: `brew install gh` (macOS) or check [installation guide](https://github.com/cli/cli#installation)
2. Authenticate: `gh auth login`
3. Copy these config files to `~/.config/gh/`

## Useful Aliases

The configuration includes several aliases to streamline common workflows:

### Pull Request Operations

| Alias             | Command                     | Description                                         |
| ----------------- | --------------------------- | --------------------------------------------------- |
| `gh co <PR#>`     | `gh pr checkout`            | Check out a pull request locally                    |
| `gh diff <PR#>`   | `gh pr diff`                | View changes in a pull request                      |
| `gh merge <PR#>`  | `gh pr merge`               | Merge a pull request                                |
| `gh prcreate`     | `gh pr create --fill --web` | Create a PR with automatic fill and open in browser |
| `gh update <PR#>` | `gh pr update-branch`       | Update PR branch with latest from base branch       |

### Issue Operations

| Alias                         | Command                            | Description                             |
| ----------------------------- | ---------------------------------- | --------------------------------------- |
| `gh close <issue#>`           | `gh issue close`                   | Close an issue                          |
| `gh add "Title"`              | `gh issue create --title "Title"`  | Create a new issue with specified title |
| `gh mine`                     | `gh issue list -a @me`             | List issues assigned to you             |
| `gh e <issue#>`               | `gh issue edit`                    | Edit an issue                           |
| `gh label <issue#> "label"`   | `gh issue edit --add-label`        | Add a label to an issue                 |
| `gh claim <issue#>`           | `gh issue edit --add-assignee @me` | Assign an issue to yourself             |
| `gh rmlabel <issue#> "label"` | `gh issue edit --remove-label`     | Remove a label from an issue            |

### Repository Operations

| Alias             | Command                         | Description                           |
| ----------------- | ------------------------------- | ------------------------------------- |
| `gh fork`         | `gh repo fork --clone --remote` | Fork a repo, clone it, and add remote |
| `gh clone <repo>` | `gh repo clone`                 | Clone a repository                    |

### Workflow Operations

| Alias                 | Command            | Description                   |
| --------------------- | ------------------ | ----------------------------- |
| `gh wf`               | `gh workflow list` | List GitHub Actions workflows |
| `gh wfrun <workflow>` | `gh workflow run`  | Run a GitHub Actions workflow |

### Search Operations

| Alias                | Command                         | Description                         |
| -------------------- | ------------------------------- | ----------------------------------- |
| `gh find <query>`    | `gh search issues --state open` | Search open issues                  |
| `gh findall <query>` | `gh search issues`              | Search all issues (open and closed) |

### Browser Shortcuts

| Alias                      | Command               | Description                        |
| -------------------------- | --------------------- | ---------------------------------- |
| `gh browse-repo`           | `gh repo view --web`  | Open current repository in browser |
| `gh browse-pr <PR#>`       | `gh pr view --web`    | Open a pull request in browser     |
| `gh browse-issue <issue#>` | `gh issue view --web` | Open an issue in browser           |

## Common Workflows

### Daily PR Review Workflow

```bash
# List PRs waiting for review
gh pr list --search "review-requested:@me"

# Check out a PR to review
gh co 123

# Review the changes
gh diff

# Approve if everything looks good
gh pr review --approve

# Or request changes if needed
gh pr review --request-changes --body "Please fix XYZ"
```

### Issue Management

```bash
# Create a new issue
gh add "Bug: Something is broken"

# Claim an issue
gh claim 456

# Add labels
gh label 456 "bug" "priority-high"

# Close when fixed
gh close 456
```

### Working with GitHub Actions

```bash
# List all workflows
gh wf

# Run a specific workflow
gh wfrun my-workflow.yml

# View recent workflow runs
gh run list
```

## Advanced Usage

For more advanced usage and complete documentation, see:

- [GitHub CLI Manual](https://cli.github.com/manual/)
- [GitHub CLI Repository](https://github.com/cli/cli)
