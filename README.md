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
| Connect this machine to the S2 home server | `ssh s2`: the `~/.ssh/config` host, and its key fetched from Proton Pass |
| Set this machine up for mobile development | Xcode, the developer tools pointed at it, and the iOS Simulator |

Projects always live in `~/Development/personal` and `~/Development/work`
(`home/.chezmoidata/folders.yaml`). git uses the personal email everywhere
except under `work/`.

Then `apply` does everything else, in this order:

1. **Brewfile**: installs the packages for the profile (asks for your password for some casks; sign in to the App Store first for the `mas` apps).
2. **Files**: writes every config and downloads Oh My Zsh, powerlevel10k, zsh-vi-mode and TPM.
3. **macOS**: creates `~/Development/{personal,work}` and `~/Documents/Screenshots`, applies the preferences. On a mobile development machine it also points the developer tools at Xcode, accepts its license and installs its first-launch components (asks for your password), then downloads the iOS Simulator (several GB). If Xcode isn't installed yet or there's no terminal for `sudo`, the step fails and runs again on the next apply.
4. **SSH and GitHub**: creates the SSH key, logs in with `gh` (a browser window opens), and uploads the key as both an authentication and a signing key, titled with the Mac's name and the account. If the machine connects to S2, it also logs in to Proton Pass (`pass-cli login` prints a link to open) and copies the S2 key to `~/.ssh/s2`.

Steps 1, 3 and 4 are the only scripts (`home/.chezmoiscripts/`). Open a new
terminal afterwards. Neovim and tmux install their own plugins the first time they start
(`vim.pack` with `home/dot_config/nvim/lua/plugins.lua`; TPM from `tmux.conf`). A few things are left as one-time manual steps, because
they're rarely needed:

- QMK keyboard: see [`qmk/README.md`](qmk/README.md).
- Rosetta: macOS offers to install it the first time an Intel-only app opens.

The machine has one SSH key, `~/.ssh/id_ed25519` (the name `gh auth login`
uses), for both git over SSH and commit signing; GitHub shows the commits as
Verified. If the GitHub step fails or you skip it, the next `chezmoi apply`
tries again; it only uploads what GitHub doesn't already have.

The S2 home server uses a second, shared key instead: its private key lives
in Proton Pass (vault `03. Homelab (S2)`, item `S2`, field `Private key`;
set in `home/.chezmoidata/ssh.yaml`), so a new Mac connects without adding
anything on the server. An existing `~/.ssh/s2` is never overwritten. S2's
host key is pinned there too (`hostKey`) and added to `~/.ssh/known_hosts`,
so the first `ssh s2` doesn't ask to trust it.

Away from home, `ssh s2` goes through the home WireGuard tunnel, and only
that session does: the rest of the Mac stays off the VPN. Its `ProxyCommand`,
`~/.local/bin/s2-proxy`, connects directly when S2 answers on the local
network or the WireGuard app's tunnel is already up. Otherwise it goes
through [wireproxy](https://github.com/windtf/wireproxy) (WireGuard as a
plain process, from the Brewfile): the first session starts one in the
background with the tunnel's config read from the login keychain, where the
WireGuard app keeps it (nothing is written to disk), and every later session
shares it. It runs until logout; after changing the tunnel's keys, run
`pkill -x wireproxy`. Sessions also share one SSH connection (`ControlMaster`),
kept 10 minutes after the last one closes. Once
per account: import the S2 tunnel in WireGuard (any name starting with `S2`,
set by `tunnel` in `ssh.yaml`) and leave it disconnected; the first
`ssh s2` asks to let `security` read it, answer Always Allow.

Change an answer later with `chezmoi init --prompt`.

---

## Daily use

| I want to… | Run | Shortcut |
|---|---|---|
| Change a config | `chezmoi edit ~/.config/zsh/alias.zsh` (opens Neovim, applies on close, commits) | `,de` |
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
VS Code and Claude Code settings are symlinks into [`linked/`](linked/README.md), so
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
├── dot_config/            → ~/.config (zsh, nvim, git, gh, ghostty, tmux, process-compose)
├── private_dot_ssh/       → ~/.ssh (mode 0700/0600)
└── private_Library/       → ~/Library, kept 0700 (VS Code, only when installed)
linked/                apps that rewrite their own settings; $HOME gets symlinks to these
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

- **Brewfile**: base packages plus the `personal` or `work` section (`HOMEBREW_DOTFILES_PROFILE`), and the mobile development section when that answer is yes (`HOMEBREW_DOTFILES_MOBILE`).
- **Configs**: `~/.ssh/config` gets the home server host on machines that connect to S2 (any profile); `~/.config/git/config.work` only exists on work.

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

### Several accounts on one Mac

Homebrew supports one owning account per install ([FAQ](https://docs.brew.sh/FAQ)),
and its apps go to `/Applications`, which every account sees. So on a Mac
with a personal and a work account:

- **Homebrew is shared.** The account that installed it owns it. In any other
  account, `brew` and the brew step of `chezmoi apply` run as that owner
  through `sudo`: they ask for the password of the account you are in, which
  must be an administrator. Read-only commands (`brew list`, `brew info`) run
  directly. Global npm packages live in the same prefix, so `npm` commands
  that change them (`npm update -g`) run as the owner too; project npm is
  untouched.
- **Configs are per account.** Each account clones this repo and runs
  `chezmoi init` with its own profile, so each has its own shell, git
  identity, SSH key and app settings.
- **Both profiles' packages end up installed**, since each account's apply
  installs its own section into the shared Homebrew.

From a non-owner account, `brew` runs from `/` (the owner cannot read your
home folder), so pass a Brewfile on stdin: `brew bundle --file=- < Brewfile`.
Mac App Store entries may not install this way; sign in to the App Store in
the owning account and run `chezmoi apply` there for those.

---

## Troubleshooting

- **Something failed halfway.** Fix the cause and run `chezmoi apply` again. Scripts are idempotent, and a failed script runs again.
- **Skip the slow parts.** `chezmoi apply --exclude scripts,externals` writes config files only.
- **Re-run a setup script.** `chezmoi state delete-bucket --bucket=entryState` (the `run_onchange_` scripts) or `--bucket=scriptState` (the `run_once_` scripts), then `chezmoi apply`.
- **Refresh plugins now.** `chezmoi apply --refresh-externals`.
- **An app changed a copied config.** `chezmoi diff` shows it; keep the app's version with `chezmoi re-add`, or the repo's with `chezmoi apply`.

More on the zsh startup order: [home/dot_config/zsh/README.md](home/dot_config/zsh/README.md).
GitHub CLI aliases: [home/dot_config/gh/README.md](home/dot_config/gh/README.md).
