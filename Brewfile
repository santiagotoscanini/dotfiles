# Brewfile: every package for every machine, split by profile.
#
# `chezmoi apply` installs it automatically whenever this file changes
# (home/.chezmoiscripts/run_onchange_before_10-brew-bundle.sh.tmpl), with the
# profile chosen at `chezmoi init`. To run it by hand:
#   brew bundle --file=Brewfile          # uses $HOMEBREW_DOTFILES_PROFILE from .zshenv
#   HOMEBREW_DOTFILES_PROFILE=work brew bundle --file=Brewfile
#
# The variable needs the HOMEBREW_ prefix: brew strips other environment
# variables before it evaluates this file. Unset means "personal".
#
# Every profile includes the base section. The mas entries need you to be
# signed in to the App Store; the npm entries need npm on PATH.

PROFILES = %w[personal work].freeze
profile = ENV.fetch("HOMEBREW_DOTFILES_PROFILE", "personal")
unless PROFILES.include?(profile)
  abort "Brewfile: unknown HOMEBREW_DOTFILES_PROFILE=#{profile.inspect} (expected: #{PROFILES.join(", ")})"
end

# ==================== base ====================

# Mac App Store CLI, needed by the mas entries
brew "mas"

# ---- Dotfiles ----
brew "chezmoi"    # Dotfiles manager that applies this repo to $HOME

# ---- Shell and CLI tools ----
brew "fzf"       # Command-line fuzzy finder
brew "ripgrep"    # Lightning-fast recursive text search tool (also used by nvim)
brew "thefuck"    # The Fuck for correcting command-line mistakes
brew "tree"       # Tree for directory listing
brew "witr"       # WITR - Explain process

# ---- Git ----
brew "git-delta"  # Git diff viewer (pager set in git/config)
brew "gh"         # GitHub CLI for pull requests, issues, and more

# ---- Neovim and the tools its config calls ----
brew "neovim"              # Hyperextensible Vim-based text editor
brew "vint"                # Vim script linter (editors/nvim/lua/linter.lua)
npm "vim-language-server"  # Vim script LSP, "vimls" (editors/nvim/lua/lsp.lua)
brew "eslint"              # JavaScript linter (editors/nvim/lua/linter.lua)
# Also needs ripgrep, listed under "Shell and CLI tools".

# ---- Terminal ----
cask "ghostty"       # Fast, feature-rich terminal emulator
brew "tmux"          # Terminal multiplexer for managing sessions

# ---- Development ----
cask "zed"                  # Zed for code editing
mas "Xcode", id: 497799835  # Xcode editor
# cask "visual-studio-code" # Settings kept in linked/vscode; deployed once installed

# ---- Work apps ----
cask "claude"         # Claude desktop app
cask "wispr-flow"     # Voice-to-text dictation
cask "google-chrome"  # Web browser
cask "ticktick"       # TickTick for task management

# ---- macOS utilities ----
cask "notunes"  # Avoid opening iTunes accidentally
cask "raycast"  # Raycast for command-line productivity
cask "shottr"   # Shottr for screen recording and screenshot management

# ---- Media ----
cask "spotify"  # Music streaming service

# ==================== personal ====================

if profile == "personal"
  # ---- Communication ----
  cask "discord"   # Voice, video, and text communication platform
  cask "whatsapp"  # WhatsApp for messaging

  # ---- Notes and files ----
  cask "nextcloud"  # Nextcloud sync app
  cask "obsidian"   # Knowledge management and note-taking app

  # ---- VPN and security ----
  cask "protonvpn"                 # ProtonVPN for secure VPN access
  mas "WireGuard", id: 1451685025  # WireGuard VPN

  # ---- Gaming ----
  cask "8bitdo-ultimate-software-v2"  # 8BitDo controller configuration
  cask "minecraft"                    # Sandbox construction video game
  cask "steam"                        # Video game distribution service

  # ---- Focus ----
  # mas "Jomo", id: 1609960918  # Jomo screen time blocker
end

# ==================== work ====================

if profile == "work"
  # ---- Communication ----
  cask "slack"  # Team collaboration and messaging platform
end
