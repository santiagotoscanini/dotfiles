# Santiago Toscanini's dotfiles

Dotfiles that are fully compatible with XDG Base Directory Specification.

- git: Looks in `$XDG_CONFIG_HOME/git/config`.
- tmux: Looks in `$XDG_CONFIG_HOME/tmux/tmux.conf`.
- tmuxinator: Looks in `$XDG_CONFIG_HOME/tmuxinator`.
- Alacritty: Looks in `$XDG_CONFIG_HOME/alacritty/alacritty.yml`.
- neovim: Looks in `$XDG_CONFIG_HOME/nvim/`.
- ideavim: Looks in `$XDG_CONFIG_HOME/ideavim/ideavimrc`.

In the case of zsh, we need to set the `ZDOTDIR` environment variable. [More Information](https://github.com/santiagotoscanini/dotfiles/tree/main/zsh#setup).

---

To stow the files, we run `./df_install.zsh`.

---

### TODO

- [x] Make it XDG Compatible.
- [x] Make an `df_install.zsh` script to stow/unstow config files.
- [x] Add IdeaVim dotfiles.
- [x] Add QMK config files.
- [x] Create script to add qmk keymaps to firmware directory (using stow).
- [ ] Make a script for OS Configurations.
- [ ] Make it available to Windows and Linux.
