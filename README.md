# Santiago Toscanini's dotfiles

```
    ____        __  _____ __
   / __ \____  / /_/ __(_) /__  _____
  / / / / __ \/ __/ /_/ / / _ \/ ___/
 / /_/ / /_/ / /_/ __/ / /  __(__  )
/_____/\____/\__/_/ /_/_/\___/____/
```

macOS dotfiles managed with [chezmoi](https://www.chezmoi.io), packages with a
[Brewfile](Brewfile). One command turns a fresh Mac into my machine: configs,
apps, SSH keys, macOS preferences, shell plugins. XDG-friendly
([XDG Base Directory](https://wiki.archlinux.org/title/XDG_Base_Directory)).

---

## Set up a new Mac

```bash
# 1. Homebrew (also installs Xcode's command line tools, which bring git)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
eval "$(/opt/homebrew/bin/brew shellenv)"

# 2. chezmoi: clone this repo into ~/Development/personal/dotfiles and set up everything
brew install chezmoi
chezmoi init --source ~/Development/personal/dotfiles --apply santiagotoscanini
```

`chezmoi init` asks once, and remembers the answers in
`~/.config/chezmoi/chezmoi.toml`:

| Question | Used for |
|---|---|
| Machine profile (`personal` / `work`) | Which Brewfile section and configs this machine gets |
| Work email (work machines only) | git commits under `~/Development/work` |

Projects always live in `~/Development/personal` and `~/Development/work`
(`home/.chezmoidata/folders.yaml`). git uses the personal email everywhere
except under `work/`.

Then `apply` does everything else, in this order:

1. **Brewfile**: installs the packages for the profile (asks for your password for some casks; sign in to the App Store first for the `mas` apps).
2. **Files**: writes every config and downloads Oh My Zsh, powerlevel10k, zsh-vi-mode and TPM.
3. **macOS**: creates `~/Development/{personal,work}` and `~/Documents/Screenshots`, applies the preferences.
4. **SSH and GitHub**: creates the SSH key, logs in with `gh` (a browser window opens), and uploads the key as both an authentication and a signing key, titled with the Mac's name.

Steps 1, 3 and 4 are the only scripts (`home/.chezmoiscripts/`). Open a new
terminal afterwards. Neovim and tmux install their own plugins the first time they start
(`vim.pack` with `home/dot_config/nvim/lua/plugins.lua`; TPM from `tmux.conf`). A few things are left as one-time manual steps, because
they're rarely needed:

- Obsidian: copy [`obsidian/.obsidian.vimrc`](obsidian/.obsidian.vimrc) into the vault, if it isn't synced there already.
- QMK keyboard: see [`qmk/README.md`](qmk/README.md).
- Rosetta: macOS offers to install it the first time an Intel-only app opens.

The machine has one SSH key, `~/.ssh/id_ed25519` (the name `gh auth login`
uses), for both git over SSH and commit signing; GitHub shows the commits as
Verified. If the GitHub step fails or you skip it, the next `chezmoi apply`
tries again; it only uploads what GitHub doesn't already have.

Change an answer later with `chezmoi init --prompt`.

---

## Daily use

| I want to… | Run | Shortcut |
|---|---|---|
| Change a config | `chezmoi edit ~/.config/zsh/alias.zsh` (opens Zed, applies on close, commits) | `,de` |
| …or edit the repo directly | edit under `home/`, then `chezmoi apply` | `,di` |
| See what apply would change | `chezmoi diff` | `,dd` |
| See drift and pending scripts | `chezmoi status` | `,dc` |
| Start tracking a file | `chezmoi add ~/.config/foo/config` | `,da` |
| Stop tracking a file (keep it) | `chezmoi forget ~/.config/foo/config` | `,dr` |
| Pull app-made changes into the repo | `chezmoi re-add` | `,dra` |
| List tracked / untracked config | `chezmoi managed` / `chezmoi unmanaged ~/.config` | `,dl` / `,dt` |
| Get changes from another machine | `chezmoi update` (git pull + apply) | `,du` |
| Add an app or tool | add it to the [Brewfile](Brewfile), then `chezmoi apply` | |
| Push the commits | `chezmoi git push` | |
| Check the setup is healthy | `chezmoi doctor` | |

`chezmoi add`, `edit` and `re-add` commit automatically; pushing is manual.
Zed and VS Code settings are symlinks into [`linked/`](linked/README.md), so
changes made in those apps show up in `git status` right away.

---

## How this repo is organized

```
.chezmoiroot           tells chezmoi the source state lives in home/
Brewfile               every package, split into base / personal / work
home/                  what ends up in $HOME (chezmoi source state)
├── .chezmoi.toml.tmpl     init questions → ~/.config/chezmoi/chezmoi.toml
├── .chezmoidata/          static data: identity, SSH keys, macOS preferences
├── .chezmoiexternal.toml  third-party downloads (Oh My Zsh, plugins, TPM)
├── .chezmoiignore         files skipped per profile or when an app is missing
├── .chezmoiscripts/       the 3 setup scripts: Brewfile, macOS, SSH and GitHub
├── .chezmoitemplates/     the shared start of every script
├── dot_zshenv             → ~/.zshenv (moves zsh config to ~/.config/zsh)
├── dot_config/            → ~/.config (zsh, nvim, git, gh, ghostty, tmux, zed)
├── private_dot_ssh/       → ~/.ssh (mode 0700/0600)
└── private_Library/       → ~/Library, kept 0700 (VS Code, only when installed)
linked/                apps that rewrite their own settings; $HOME gets symlinks to these
obsidian/              .obsidian.vimrc (copied into the vault by hand)
qmk/                   Corne keyboard keymap (QMK External Userspace, not deployed)
AGENTS.md              how AI agents should work in this repo
```

File names under `home/` follow chezmoi's
[naming rules](https://www.chezmoi.io/reference/source-state-attributes/):
`dot_` → leading dot, `private_` → owner-only permissions, `symlink_` → a
symlink, `.tmpl` → rendered with machine data, `run_once_` / `run_onchange_`
→ scripts.

### Profiles

The profile chosen at `chezmoi init` drives:

- **Brewfile**: base packages plus the `personal` or `work` section (`HOMEBREW_DOTFILES_PROFILE`).
- **Configs**: `~/.ssh/config` gets the home server host on personal; `~/.config/git/config.work` only exists on work.

### Machine-only settings (not tracked)

| File | For |
|---|---|
| `~/.config/zsh/local.zsh`, `~/.config/zsh/work.zsh` | Shell additions for one machine |
| `~/.config/git/config.local` | git settings for one machine, e.g. `git maintenance` repos |
| `~/.ssh/config.local` | SSH hosts for one machine |

### Packages

[`Brewfile`](Brewfile) lists formulae, casks, Mac App Store apps and npm
globals. `chezmoi apply` runs `brew bundle --no-upgrade` whenever the file
changes, so it only installs what is missing; nothing is ever uninstalled.

```bash
brew upgrade                                  # upgrade on your schedule
brew bundle cleanup --file=Brewfile           # list installed things NOT in the Brewfile
brew bundle cleanup --file=Brewfile --force   # uninstall them
```

---

## Troubleshooting

- **Something failed halfway.** Fix the cause and run `chezmoi apply` again. Scripts are idempotent, and a failed script runs again.
- **Skip the slow parts.** `chezmoi apply --exclude scripts,externals` writes config files only.
- **Re-run a setup script.** `chezmoi state delete-bucket --bucket=entryState` (the `run_onchange_` scripts) or `--bucket=scriptState` (the `run_once_` scripts), then `chezmoi apply`.
- **Refresh plugins now.** `chezmoi apply --refresh-externals`.
- **An app changed a copied config.** `chezmoi diff` shows it; keep the app's version with `chezmoi re-add`, or the repo's with `chezmoi apply`.

More on the zsh startup order: [home/dot_config/zsh/README.md](home/dot_config/zsh/README.md).
GitHub CLI aliases: [home/dot_config/gh/README.md](home/dot_config/gh/README.md).
