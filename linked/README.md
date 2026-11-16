# linked/

Settings for apps that **rewrite their own config files** (Zed, VS Code).

Everything under `home/` is copied into `$HOME` by `chezmoi apply`, so if an app
saved a change to its copy, the next apply would overwrite it. The files here
are different: chezmoi puts a **symlink** in `$HOME` that points back to this
folder, so whatever the app writes lands straight in the git working tree,
ready to commit.

| File in this folder | Symlink in $HOME | Defined by |
|---|---|---|
| `zed/settings.json` | `~/.config/zed/settings.json` | `home/dot_config/zed/symlink_settings.json.tmpl` |
| `zed/keymap.json` | `~/.config/zed/keymap.json` | `home/dot_config/zed/symlink_keymap.json.tmpl` |
| `vscode/settings.json` | `~/Library/Application Support/Code/User/settings.json` | `home/private_Library/Application Support/Code/User/symlink_settings.json.tmpl` |
| `vscode/keybindings.json` | `…/Code/User/keybindings.json` | `…/symlink_keybindings.json.tmpl` |
| `vscode/snippets/santi-snippets.code-snippets` | `…/Code/User/snippets/santi-snippets.code-snippets` | `…/snippets/symlink_santi-snippets.code-snippets.tmpl` |

The VS Code links are only created on Macs where VS Code is installed
(see `home/.chezmoiignore`).

To add another app: put its file here, then create
`home/<target path>/symlink_<name>.tmpl` containing
`{{ joinPath .chezmoi.workingTree "linked/<app>/<name>" }}`.
