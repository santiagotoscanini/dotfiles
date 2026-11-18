# AGENTS.md

Guide for AI agents working in this repo. Read it fully before changing
anything. Human-facing docs are in [README.md](README.md).

## What this repo is

The [chezmoi](https://www.chezmoi.io) **source state** for Santiago's Macs.
`chezmoi apply` renders it into `$HOME`. Packages live in [`Brewfile`](Brewfile).
There is no other tooling: no build step, no custom CLI.

- `.chezmoiroot` contains `home`, so **only `home/` is chezmoi source state**.
  Files outside it (`Brewfile`, `linked/`, `qmk/`, docs) are never deployed
  as-is.
- Each machine has a profile, `personal` or `work`, plus a few answers from
  `chezmoi init`, stored outside the repo in `~/.config/chezmoi/chezmoi.toml`.
  Run `chezmoi data` to see every value templates can use.

## Golden rules

1. **Edit the source, never the target.** Change `home/dot_config/zsh/alias.zsh`,
   not `~/.config/zsh/alias.zsh`; the target is overwritten on the next apply.
   Exception: files under `linked/` are the real files ($HOME holds symlinks
   to them).
2. **Don't run `chezmoi apply`, `chezmoi update`, `brew bundle` or any
   `.chezmoiscripts` script without the user's explicit OK.** They change the
   real machine: install apps, write `defaults`, generate SSH keys. Verify with
   the read-only commands below instead.
3. **Never put secrets in the repo**: no private keys, tokens or `gh/hosts.yml`.
   Machine-specific or private values belong in `.chezmoi.toml.tmpl` prompts,
   or in the untracked `*.local` / `local.zsh` / `work.zsh` files.
4. **No hardcoded home paths.** Use `{{ .chezmoi.homeDir }}`, `$HOME`, `~` or
   `$XDG_*`. The user name differs between machines.
5. **Keep it minimal.** Unused things get removed, not disabled. Don't add configs
   for apps that aren't in the Brewfile, and ask before adding new tools.
6. **Commits:** only when asked. Never push without being asked.

## Map

| Path | Purpose |
|---|---|
| `Brewfile` | Ruby DSL: `brew`, `cask`, `mas`, `npm` entries in base / `if profile == "personal"` / `if profile == "work"` sections, grouped by purpose with a trailing comment each |
| `home/.chezmoi.toml.tmpl` | `chezmoi init` questions (`promptChoiceOnce` / `promptStringOnce`) → `[data]` plus chezmoi settings (edit command, diff pager, autoCommit, scriptEnv) |
| `home/.chezmoidata/*.yaml` | Static data merged into templates: `identity` (name, GitHub user, personal email), `devDir` (projects folder: `~/Development/{personal,work}`, fixed), `ssh.key` (the one SSH key, `id_ed25519`), `ssh.s2` (home server host, user and the Proton Pass reference of its shared key), `macos.defaults` and `macos.restart`. **Cannot contain templates.** |
| `home/.chezmoiexternal.toml` | Downloaded third-party code: Oh My Zsh, powerlevel10k, zsh-vi-mode (`archive`, `exact`), TPM. Weekly refresh |
| `home/.chezmoiignore` | Template. Skips docs (`**/README.md`), runtime caches inside externals, work-only files on personal, and VS Code when it isn't installed (`stat`) |
| `home/.chezmoiremove` | Targets deleted on apply: files an earlier version of the repo deployed and no longer does. Add a line when you delete or rename a deployed file |
| `home/.chezmoiscripts/` | Setup scripts (see below). Never deployed as files |
| `home/.chezmoitemplates/` | `script-prelude.sh`: strict mode, Homebrew on PATH, `log`/`warn` |
| `home/dot_zshenv` | `~/.zshenv`: sets `ZDOTDIR=~/.config/zsh` |
| `home/dot_config/zsh/` | `.zshenv` (template: `DOTFILES_DIR`, `DEV_DIR`, profile), `.zshrc`, `oh-my.zsh`, `alias.zsh`, `.p10k.zsh` |
| `home/dot_config/{nvim,git,gh,ghostty,tmux}` | App configs; `git/config*.tmpl` are templates. Neovim and tmux install their plugins themselves on first start (`vim.pack` with `nvim/lua/plugins.lua`; TPM from `tmux.conf`). One colour scheme everywhere: Catppuccin Latte (light) / Frappe (dark) in Ghostty, Neovim and tmux |
| `home/dot_config/nvim/symlink_nvim-pack-lock.json.tmpl`, `home/private_Library/…/Code/User/**/symlink_*.tmpl`, `home/dot_claude/symlink_settings.json.tmpl` | Symlinks into `linked/` |
| `home/dot_config/agents/AGENTS.md` | `~/.config/agents/AGENTS.md`: global rules for every AI agent on any machine (e.g. system-wide tools go through the `Brewfile`). Kept in an agent-neutral location; each agent's global config points here |
| `home/dot_claude/CLAUDE.md` | `~/.claude/CLAUDE.md`: Claude Code's user-level memory, a single `@~/.config/agents/AGENTS.md` import. Next to it, `symlink_settings.json.tmpl` links `~/.claude/settings.json` to `linked/claude/settings.json` (commit attribution off). chezmoi manages only these two, never the rest of `~/.claude` |
| `home/private_dot_ssh/private_config.tmpl` | `~/.ssh/config` (0600 inside a 0700 dir) |
| `linked/` | Real files for apps that rewrite them: VS Code and Claude Code settings, Neovim's plugin lockfile |
| `qmk/` | QMK External Userspace for the Corne keymap. Not deployed |

## Scripts (`home/.chezmoiscripts/`)

Ordering: `before_` scripts run before files are written, `after_` scripts
after, and alphabetically within each group, so the number prefix sets the
order. Every script must be **idempotent**, start with `#!/bin/bash` followed
by `{{ template "script-prelude.sh" . }}`, and be a `.tmpl` so it can use data.
A template that renders to empty or whitespace is skipped, which is how
`{{ if eq .chezmoi.os "darwin" }}…{{ end }}` gates work.

| Script | Kind | Re-runs when |
|---|---|---|
| `run_onchange_before_10-brew-bundle` | `brew bundle --no-upgrade`. In an account that does not own the Homebrew prefix it runs as the owner through `sudo`, Brewfile on stdin (Homebrew supports one owning account; see README "Several accounts on one Mac") | Brewfile sha256 or profile changes (both embedded in a comment) |
| `run_onchange_after_10-macos` | `mkdir -p` the projects/screenshot folders, `defaults write`, `killall` | `macos.yaml` or `folders.yaml` changes |
| `run_onchange_after_20-ssh-and-github` | `ssh-keygen` if missing, `allowed_signers`, `gh auth login` if needed, uploads the key as auth + signing key where GitHub lacks it, adds GitHub's host keys (from `gh api meta`) to `known_hosts`; on S2 machines, `pass-cli login` if needed and copies the S2 key from Proton Pass to `~/.ssh/s2` | key, emails, GitHub user or S2 answer change. Last on purpose: interactive (browser); a failure doesn't block the others and is retried next apply |

**Keep it at three.** The user wants a lean setup: no script for things done
once and rarely (Rosetta,
QMK); those are one-line manual steps in README.md. Homebrew is installed by
hand before chezmoi (it provides chezmoi itself), so no script installs it.
Before adding a script, ask; prefer extending one of the three.

`run_onchange_` re-runs whenever the **rendered** script changes. To make a
script depend on another file, embed its hash in a comment:
`# {{ include "dot_config/some/file" | sha256sum }}`. For files outside
`home/`, use `{{ joinPath .chezmoi.workingTree "Brewfile" }}`.

## Template cheatsheet

- Data: `.profile`, `.workEmail`, `.s2` (per machine; read `.s2` with `dig "s2" false .`
  so machines initialised before the question still render), `.devDir` (`Development`), `.identity.*`,
  `.ssh.key`, `.macos.*`, plus built-ins `.chezmoi.homeDir`, `.chezmoi.os`,
  `.chezmoi.arch`, `.chezmoi.workingTree` (repo root) and `.chezmoi.sourceDir`
  (`home/`).
- Templates fail on missing keys. Use `hasKey . "x"` before reading optional
  fields in data lists.
- A literal `{{` in a `.tmpl` file must be written `{{ "{{" }}`.
- Only add `.tmpl` when a file needs data. `chezmoi re-add` doesn't work on
  templates, so plain files are easier to round-trip.

## Recipes

**Add a config file for an installed app**: create it under `home/` with
chezmoi naming (`~/.config/foo/bar.toml` → `home/dot_config/foo/bar.toml`), or
ask the user to run `chezmoi add ~/.config/foo/bar.toml`. If the app rewrites
the file itself, put it in `linked/foo/` and add
`home/dot_config/foo/symlink_bar.toml.tmpl` containing
`{{ joinPath .chezmoi.workingTree "linked/foo/bar.toml" }}`. Then update
`linked/README.md`.

**Profile-specific file**: add its target path to the profile block in
`home/.chezmoiignore`. **Profile-specific lines**: make the file a `.tmpl` and
wrap them in `{{ if eq .profile "work" }}…{{ end }}`.

**Add a package**: add a line to the right section and group of the
`Brewfile`, with a trailing `# description` aligned to its neighbours.

**Add a macOS preference**: append an entry to `home/.chezmoidata/macos.yaml`
(`domain`, `key`, `type`, `value`, `why`). Add the process to `restart` if
needed.

**SSH key**: one key per machine, `~/.ssh/id_ed25519` (the name `gh auth login`
uses), for both GitHub auth and commit signing. Its name lives only in
`home/.chezmoidata/ssh.yaml`; templates use `.ssh.key`. The one exception is
S2's shared key, `~/.ssh/s2`, copied from Proton Pass (`.ssh.s2`) on machines
that answered yes at init. Ask before adding other per-host keys.

**Add a shell plugin or theme**: add an `archive` entry under
`.oh-my-zsh/custom/...` in `.chezmoiexternal.toml`, then enable it in
`home/dot_config/zsh/oh-my.zsh`.

**Add an init question**: add a `promptStringOnce` / `promptChoiceOnce` to
`.chezmoi.toml.tmpl`, write it under `[data]`, give it a default, and document
it in README.md. Existing machines pick it up with `chezmoi init`.

## Verifying changes (safe, read-only)

```bash
chezmoi execute-template < home/path/to/file.tmpl     # render one template
chezmoi cat ~/.config/git/config                      # target content for one file
chezmoi diff                                          # what apply would change (scripts excluded)
chezmoi status                                        # drift + scripts that would run
chezmoi apply --dry-run --verbose                     # full plan, nothing written
chezmoi managed                                       # what is tracked
chezmoi doctor                                        # environment check
```

Test both profiles without touching `$HOME` by rendering into a scratch
folder with a throwaway config:

```bash
chezmoi --source "$PWD" execute-template --init \
  --promptChoice "Machine profile=work" \
  --promptString "Work email (git commits in the work folder)=me@example.com" \
  < home/.chezmoi.toml.tmpl > /tmp/cz-work.toml
chezmoi --config /tmp/cz-work.toml --destination /tmp/cz-home \
  --persistent-state /tmp/cz-state.boltdb apply --exclude scripts
```

`.chezmoi.homeDir` still renders as the real home folder in that test.
Scripts are excluded because they act on the real machine. Check them with
`execute-template` and `bash -n` instead.

After editing the Brewfile, check that it parses for both profiles:

```bash
HOMEBREW_DOTFILES_PROFILE=personal brew bundle list --all --file=Brewfile
HOMEBREW_DOTFILES_PROFILE=work     brew bundle list --all --file=Brewfile
```
