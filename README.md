# Santiago Toscanini's dotfiles

```
    ____        __  _____ __
   / __ \____  / /_/ __(_) /__  _____
  / / / / __ \/ __/ /_/ / / _ \/ ___/
 / /_/ / /_/ / /_/ __/ / /  __(__  )
/_____/\____/\__/_/ /_/_/\___/____/
```

Dotfiles that are fully compatible with [XDG Base Directory Specification](https://wiki.archlinux.org/title/XDG_Base_Directory).

For zsh we need to set the `ZDOTDIR` environment variable. [More Information](https://github.com/santiagotoscanini/dotfiles/tree/main/zsh#setup).

---

To stow the files, we run `sudo ./df_install.zsh`.
Sudo is needed to create the Daemon Agents for the `dark-mode-notifier`.

---

### TODO

- [x] Make it XDG Compatible.
- [x] Make an `df_install.zsh` script to stow/unstow config files.
- [x] Add IdeaVim dotfiles.
- [x] Add QMK config files.
- [x] Create script to add qmk keymaps to firmware directory (using stow).
- [ ] Sign commits using SSH instead of GPG when macOS's SSH support signing arbitrary data.
- [ ] Make a script for OS Configurations.
- [ ] Make it available to Windows and Linux.
