# Dotfile Manager

A clean, type-safe dotfile manager for macOS that uses your existing packages.json structure.

## Features

- **Clean Architecture**: Simple, type-safe Python code
- **Easy to understand**: Each handler is a simple class with 3 methods
- **Clean uninstall**: Properly remove packages, symlinks, and settings
- **Multiple Handlers**:
  - Homebrew packages (formulas and casks)
  - Symbolic links with backup
  - macOS defaults settings
  - Shell scripts
  - Directory creation
- **Profile-based**: Organize packages into reusable profiles
- **Dry-run mode**: Preview changes before applying
- **Embedded configuration**: Packages define their own config/symlink paths

## Quick Start

```bash
# Install the default profile (runs pre-install, then packages)
python3 dotfile install

# Install a specific profile
python3 dotfile install --profile work

# Check installation status
python3 dotfile check

# Backup current brew packages to packages.json
python3 dotfile backup

# List packages not tracked in any profile
python3 dotfile untracked

# Preview what would be done
python3 dotfile install --dry-run

# Uninstall a profile
python3 dotfile uninstall --profile personal
```

## Configuration

Uses the existing `packages.json` file in your dotfiles directory.

### Package Structure

Packages can include their own configuration paths that will be automatically symlinked:

```json
{
  "packages": {
    "git": {
      "description": "Distributed version control system",
      "macos": {
        "brew": "git"
      },
      "config": {
        "source": "git",
        "destination": "$XDG_CONFIG_HOME/git"
      }
    },
    "neovim": {
      "description": "Hyperextensible Vim-based text editor",
      "macos": {
        "brew": "neovim"
      },
      "config": {
        "source": "editors/nvim",
        "destination": "$XDG_CONFIG_HOME/nvim"
      }
    }
  }
}
```

When a package is installed, if it has a `config` section, the symlink will be automatically created.

### Pre-install Tasks

Setup tasks that run before package installation:

```json
{
  "pre-install": {
    "homebrew": {
      "description": "Homebrew package manager",
      "macos": {
        "check": "command -v brew",
        "install": "/bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
      }
    },
    "dev-directories": {
      "description": "Create development directory structure",
      "provider": "directory",
      "macos": {
        "paths": [
          "$HOME/dev/personal",
          "$HOME/dev/work"
        ]
      }
    },
    "dock-autohide": {
      "description": "Enable dock auto-hide",
      "provider": "defaults",
      "macos": {
        "domain": "com.apple.dock",
        "key": "autohide",
        "type": "bool",
        "value": true
      }
    }
  }
}
```

Handler types (`provider` field):
- No provider or has `check`/`install`: Script handler
- `directory`: Creates directories
- `defaults`: Sets macOS defaults

### Profiles

Profiles define which packages and pre-install tasks to run. Profiles can extend other profiles using the `base` field:

```json
{
  "profiles": {
    "base": {
      "pre-install": [
        "homebrew",
        "dev-directories"
      ],
      "packages": [
        "git",
        "neovim",
        "tmux"
      ]
    },
    "personal": {
      "base": "@base",
      "pre-install": [
        "dock-autohide"
      ],
      "packages": [
        "ghostty",
        "spotify"
      ]
    },
    "work": {
      "base": "@base",
      "packages": [
        "docker",
        "slack",
        "zoom"
      ]
    }
  }
}
```

When using profile inheritance:
- The `base` field can be a string (`"@base"`) or an array (`["@base", "@dev"]`)
- Base profile items are included first, then the current profile's items
- Duplicates are automatically removed (items from the current profile take precedence)
- The `@` prefix is optional but recommended for clarity

## Architecture

The manager uses a clean, extensible architecture:

```
dotfile/
├── __init__.py
├── core/
│   ├── __init__.py
│   ├── handler.py      # Simple handler types (Status, CheckResult)
│   ├── config.py       # Configuration management for packages.json
│   ├── runner.py       # Execution engine
│   └── utils.py        # Utility functions
└── handlers/
    ├── __init__.py
    ├── brew.py         # Homebrew handler
    ├── symlink.py      # Symlink handler
    ├── defaults.py     # macOS defaults handler
    ├── script.py       # Script runner handler
    └── directory.py    # Directory creator handler
```

### Handler Interface

Each handler is a simple class with three methods:

```python
class MyHandler:
    def check(self, config: Dict[str, Any]) -> CheckResult:
        """Check if item is installed/configured."""
        pass
    
    def install(self, config: Dict[str, Any], dry_run: bool = False) -> bool:
        """Install/configure the item."""
        pass
    
    def uninstall(self, config: Dict[str, Any], dry_run: bool = False) -> bool:
        """Uninstall/remove the item."""
        pass
```

## Uninstall Support

The manager can fully uninstall profiles, removing packages and their configurations:

```bash
# Uninstall a specific profile
python3 dotfile uninstall --profile work

# Preview what would be removed
python3 dotfile uninstall --profile personal --dry-run
```

Uninstalling will:
- Remove Homebrew packages (brew uninstall)
- Delete symlinks created by packages (only if they point to your dotfiles)
- Remove macOS defaults settings
- Keep directories (they might contain user data)

## Environment Variables

- `DOTFILES_DIR`: Path to your dotfiles directory (default: script location)
- `HOME`: User's home directory
- `XDG_CONFIG_HOME`: XDG config directory (default: ~/.config)

## Backing Up System State

The manager can discover and save your currently installed brew packages:

```bash
# Save all installed packages to packages.json
python3 dotfile backup

# List packages that are installed but not tracked
python3 dotfile untracked
```

This is useful for:
- Backing up your current system configuration
- Migrating to a new machine
- Keeping your dotfiles in sync with what's actually installed

When you run `backup`, it will:
1. Discover all installed brew formulas and casks (using `brew leaves` for formulas)
2. Add any new packages to packages.json with auto-generated descriptions
3. Preserve any existing package configurations
4. You manually decide which profiles should include these packages

## License

MIT