# Santree

A beautiful CLI for managing Git worktrees with Linear and GitHub integration.

Built with [React](https://react.dev/), [Ink](https://github.com/vadimdemedes/ink), and [Pastel](https://github.com/vadimdemedes/pastel).

## Features

- **Worktree Management**: Create, switch, list, and remove Git worktrees
- **Linear Integration**: Extract ticket IDs from branch names for Claude AI workflows
- **GitHub Integration**: View PR status, create PRs, and clean up merged branches
- **Claude AI Integration**: Launch Claude with context about your current ticket
- **Beautiful UI**: Animated spinners, colored output, and box-styled layouts

## Commands

| Command | Description |
|---------|-------------|
| `santree list` | List all worktrees with status, PR info, and commits ahead |
| `santree create <branch>` | Create a new worktree from base branch |
| `santree switch <branch>` | Switch to another worktree |
| `santree remove <branch>` | Remove a worktree and its branch |
| `santree sync` | Sync current worktree with base branch (merge by default) |
| `santree setup` | Run the init script (`.santree/init.sh`) |
| `santree work` | Launch Claude to work on the current ticket |
| `santree clean` | Remove worktrees with merged/closed PRs |

## Options

### create
- `--base <branch>` - Base branch to create from (default: main/master)
- `--work` - Launch Claude after creating
- `--plan` - With --work, only create implementation plan
- `--no-pull` - Skip pulling latest changes

### sync
- `--rebase` - Use rebase instead of merge

### work
- `--plan` - Only create implementation plan
- `--review` - Review changes against ticket requirements
- `--fix-pr` - Fetch PR comments and fix them

### remove
- `--force` - Force removal even with uncommitted changes

### clean
- `--dry-run` - Show what would be removed without removing
- `--force` - Skip confirmation prompt

## Setup

### Init Script

Create `.santree/init.sh` in your repository root to run custom setup when creating worktrees:

```bash
#!/bin/bash
# Example: Copy .env, install dependencies, etc.
cp "$SANTREE_REPO_ROOT/.env" "$SANTREE_WORKTREE_PATH/.env"
npm install
```

Environment variables available:
- `SANTREE_WORKTREE_PATH` - Path to the new worktree
- `SANTREE_REPO_ROOT` - Path to the main repository

### Branch Naming

For Linear integration, use branch names with ticket IDs:

```
user/TEAM-123-feature-description
feature/PROJ-456-add-auth
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run locally
node dist/cli.js <command>
```

## Shell Integration

The shell wrapper in `alias.zsh` handles directory switching for `create` and `switch` commands, since child processes cannot change the parent shell's directory.
