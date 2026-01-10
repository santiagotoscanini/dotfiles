# Santiago Toscanini's dotfiles

```
    ____        __  _____ __
   / __ \____  / /_/ __(_) /__  _____
  / / / / __ \/ __/ /_/ / / _ \/ ___/
 / /_/ / /_/ / /_/ __/ / /  __(__  )
/_____/\____/\__/_/ /_/_/\___/____/
```

Dotfiles that are fully compatible with [XDG Base Directory Specification](https://wiki.archlinux.org/title/XDG_Base_Directory).
Utility for XDG ([XDG Ninja](https://github.com/b3nj5m1n/xdg-ninja)).

---

## Installation

Use the `dots` CLI to manage packages and symlinks:

```bash
# Check installation status
dots check --profile personal

# Install a profile
dots install --profile personal

# List available profiles and packages
dots list
```

See `dots --help` for all available commands.

---

## TODO

- [x] Make it XDG Compatible.
- [x] Make an `install.py` script to link config files.
- [x] Sign commits using SSH instead of GPG when macOS's SSH support signing arbitrary data.
- [x] Make a script for macOS Configurations.
- [x] Migrate dotfile manager to TypeScript/Ink (`dots` CLI).
- [ ] Make it available to Linux.
- [ ] Make it available to Windows.
