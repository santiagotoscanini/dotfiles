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

# Fonts go to /Library/Fonts instead of the default ~/Library/Fonts: on a Mac
# with several accounts, brew runs as the account that owns Homebrew, so a
# per-user font would only reach that account.
cask_args fontdir: "/Library/Fonts"

# ==================== base ====================

# Mac App Store CLI, needed by the mas entries
brew "mas"

# ---- Dotfiles ----
brew "chezmoi"    # Dotfiles manager that applies this repo to $HOME

# ---- Shell and CLI tools ----
brew "fd"         # Fast alternative to find (nvim file tree search)
brew "fzf"        # Command-line fuzzy finder
brew "ripgrep"    # Lightning-fast recursive text search tool (also used by nvim)
brew "tree"       # Tree for directory listing
brew "witr"       # WITR - Explain process

# ---- Git ----
brew "git-delta"  # Git diff viewer (pager set in git/config)
brew "gh"         # GitHub CLI for pull requests, issues, and more

# ---- Neovim and the tools its config calls ----
brew "neovim"                       # Hyperextensible Vim-based text editor
brew "tree-sitter-cli"              # Compiles Treesitter parsers (nvim/lua/treesitter.lua)
brew "vint"                         # Vim script linter (nvim/lua/linter.lua)
brew "ruff"                         # Python formatter and linter (nvim/lua/linter.lua)
brew "stylua"                       # Lua formatter (nvim/lua/linter.lua)
brew "node"                         # JavaScript runtime; its npm installs the npm entries below
npm "vim-language-server"           # Vim script LSP, "vimls" (nvim/lua/lsp.lua)
brew "typescript"                   # TypeScript 7 compiler and LSP, "tsc" (nvim/lua/lsp.lua)
brew "pyright"                      # Python LSP (nvim/lua/lsp.lua)
npm "graphql-language-service-cli"  # GraphQL LSP, "graphql-lsp" (nvim/lua/lsp.lua)
# Also needs ripgrep and fd, listed under "Shell and CLI tools".

# ---- Go ----
brew "go"             # Go compiler and tools
brew "gopls"          # Go LSP: completion, gofumpt formatting, imports (nvim/lua/lsp.lua)
brew "golangci-lint"  # Go linter (nvim/lua/linter.lua)
brew "delve"          # Go debugger, "dlv" (nvim/lua/debug-config.lua)
brew "gotestsum"      # Go test runner with reliable output (nvim/lua/test-config.lua)

# ---- Fonts ----
cask "font-jetbrains-mono-nerd-font"  # Obsidian text and code font; Nerd Font glyphs for the shell prompt

# ---- Terminal ----
cask "ghostty"       # Fast, feature-rich terminal emulator
brew "tmux"          # Terminal multiplexer for managing sessions

# ---- Development ----
cask "zed"                  # Zed for code editing
mas "Xcode", id: 497799835  # Xcode editor
# cask "visual-studio-code" # Settings kept in linked/vscode; deployed once installed

# ---- Claude ----
cask "claude"                                # Claude desktop app
cask "claude-code"                           # Claude Code CLI, also used by Obsidian's Agent Client plugin
npm "@agentclientprotocol/claude-agent-acp"  # ACP adapter: lets Agent Client (Obsidian) drive Claude Code

# ---- Apps ----
cask "wispr-flow"     # Voice-to-text dictation
cask "google-chrome"  # Web browser
cask "ticktick"       # TickTick for task management
cask "obsidian"       # Notes vault; also links the `obsidian` CLI into the Homebrew bin

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

  # ---- VPN and security ----
  cask "protonvpn"                 # ProtonVPN for secure VPN access
  mas "WireGuard", id: 1451685025  # WireGuard VPN

  # ---- Gaming ----
  cask "8bitdo-ultimate-software-v2"  # 8BitDo controller configuration
  cask "minecraft"                    # Sandbox construction video game
  cask "steam"                        # Video game distribution service

end

# ==================== work ====================

if profile == "work"
  # ---- Communication ----
  cask "slack"  # Team collaboration and messaging platform

  # ---- Flai monorepo ----
  brew "colima"          # Docker-compatible VM; runs Supabase, Redis and LocalStack
  brew "docker"          # Docker CLI that talks to the Colima VM
  brew "docker-compose"  # `docker compose` plugin (linked from ~/.docker/cli-plugins)
  brew "pnpm"            # Workspace package manager; switches to the repo's pinned version
  brew "temporal"        # Temporal dev server for the core worker
  brew "uv"              # Python env and 3.12 runtime for agents/voice
  cask "ngrok"           # Tunnel to the local API for webhook testing
end
