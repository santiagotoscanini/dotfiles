# linked/

Files that **apps rewrite themselves**: Zed, VS Code and Claude Code settings,
and Neovim's plugin lockfile.

Everything under `home/` is copied into `$HOME` by `chezmoi apply`, so if an app
saved a change to its copy, the next apply would overwrite it. The files here
are different: chezmoi puts a **symlink** in `$HOME` that points back to this
folder, so whatever the app writes lands straight in the git working tree,
ready to commit.

| File in this folder | Symlink in $HOME | Defined by |
|---|---|---|
| `zed/settings.json` | `~/.config/zed/settings.json` | `home/dot_config/zed/symlink_settings.json.tmpl` |
| `zed/keymap.json` | `~/.config/zed/keymap.json` | `home/dot_config/zed/symlink_keymap.json.tmpl` |
| `nvim/nvim-pack-lock.json` | `~/.config/nvim/nvim-pack-lock.json` | `home/dot_config/nvim/symlink_nvim-pack-lock.json.tmpl` |
| `claude/settings.json` | `~/.claude/settings.json` | `home/dot_claude/symlink_settings.json.tmpl` |
| `vscode/settings.json` | `~/Library/Application Support/Code/User/settings.json` | `home/private_Library/Application Support/Code/User/symlink_settings.json.tmpl` |
| `vscode/keybindings.json` | `…/Code/User/keybindings.json` | `…/symlink_keybindings.json.tmpl` |
| `vscode/snippets/santi-snippets.code-snippets` | `…/Code/User/snippets/santi-snippets.code-snippets` | `…/snippets/symlink_santi-snippets.code-snippets.tmpl` |

`nvim-pack-lock.json` records the exact commit of every Neovim plugin. Neovim
rewrites it on install and on `:lua vim.pack.update()`; commit it so every
machine gets the same plugin versions.

`claude/settings.json` holds Claude Code's user-level settings. An empty
`attribution.commit` / `attribution.pr` stops it adding "Co-Authored-By" and
"Generated with Claude Code" lines to commits and pull requests.

The VS Code links are only created on Macs where VS Code is installed
(see `home/.chezmoiignore`).

To add another app: put its file here, then create
`home/<target path>/symlink_<name>.tmpl` containing
`{{ joinPath .chezmoi.workingTree "linked/<app>/<name>" }}`.
