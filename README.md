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
- [ ] Make a script to install all the CLI dependencies (`brew`, `stow`, `oh-my-zsh` (downloading and copying themes and plugins to corresponding folders), `qmk-firmware` (with its dependencies, `avrdude`, etc), `poetry`, `sdkman` (`flutter`, `android-sdk`, `go`, `dart`, `python`), `docker`, `neovim` (with its extensions), `tmux` (with its extensions), `tmuxinator`, `tldr`, `solc`, `git`, `gh`, `fzf`, `jq`, commands specific to a language like `gopls`, `node`, etc.).
- [ ] Make a script to install all the software:
  * MacOS
    - [ ] [AltTab](https://alt-tab-macos.netlify.app)
    - [ ] [Stats](https://github.com/exelban/stats)
    - [ ] [HiddenBar](https://github.com/dwarvesf/hidden)
    - [ ] [Raycast](https://www.raycast.com)
    - [ ] [Clocker](https://apps.apple.com/us/app/clocker/id1056643111)
    - [ ] [Amphetamine](https://apps.apple.com/us/app/amphetamine/id937984704)
  * Development
    - [ ] Ganache
    - [ ] Postman / Insomnia
    - [ ] DataGrip
    - [ ] VSCode
    - [ ] Alacritty
  * Communication
    - [ ] Slack / Teams / WhatsApp / Zoom / Beeper
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
- [ ] Make a script for OS Configurations.
- [ ] Make it available to Windows and Linux.
