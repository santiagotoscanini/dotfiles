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

To stow the files, we run `zsh install.zsh`.

---

### TODO

- [x] Make it XDG Compatible.
- [x] Make an `install.zsh` script.
- [x] Add IdeaVim dotfiles.
- [x] Add QMK config files.
- [x] Create script to add qmk keymaps to firmware directory (using stow).
- [ ] Make a script to install all the CLI dependencies (`stow`, `oh-my-zsh` (copying themes and plugins to folders), `qmk-firmware`, `poetry`, `sdkman` (`flutter`, `android-sdk`, `go`, `dart`, `python`), `docker`, `neovim`, `tmux`, `tldr`, `solc` etc.).
- [ ] Make a script to install all the software:
  * MacOS
    - [ ] [AltTab](https://alt-tab-macos.netlify.app)
    - [ ] [Stats](https://github.com/exelban/stats)
    - [ ] [HiddenBar](https://github.com/dwarvesf/hidden)
    - [ ] [Raycast](https://www.raycast.com)
  * Development
    - [ ] Ganache
    - [ ] Postman / Insomnia
    - [ ] DataGrip
    - [ ] VSCode
    - [ ] Alacritty
  * Communication
    - [ ] Slack / Teams / WhatsApp / Zoom
  * Devices
    - [ ] QMK Toolbox
    - [ ] Logi Options+
    - [ ] calibre
    - [ ] Ledger Live
  * General
    - [ ] Notion / Obsidian
    - [ ] TickTick
    - [ ] Brave / Chrome
    - [ ] Spotify
- [ ] Separate all from my user.
- [ ] Make it available to Windows and Linux.
