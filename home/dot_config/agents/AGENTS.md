# Global agent instructions

Applies to every project on this machine. A project's own `AGENTS.md` /
`CLAUDE.md` adds to these and wins on conflict.

Deployed by chezmoi from the dotfiles repo (`$DOTFILES_DIR`), file
`home/dot_config/agents/AGENTS.md`. Edit it there, not in `~/.config`.

## Installing dependencies

Every machine is rebuilt from the dotfiles repo, so anything installed outside
it is lost on the next Mac and invisible to the other ones.

- **System-wide tools** (CLIs, apps, language runtimes, LSPs, anything used
  across projects) go in `$DOTFILES_DIR/Brewfile`. Never run a bare
  `brew install`, `npm install -g`, `pipx install`, `go install`,
  `cargo install` or `mas install` to get one.
  - Add a `brew` / `cask` / `mas` / `npm` line to the right section (base, or
    `personal` / `work` only when the tool belongs to one profile) and group,
    with a trailing `# description` aligned to its neighbours.
  - Then ask before installing. The user runs `brew bundle` or
    `chezmoi apply`, or approves you running it.
  - If the tool needs a config file, follow the recipes in
    `$DOTFILES_DIR/AGENTS.md`.
- **Project-specific dependencies** stay in the project's own manifest
  (`package.json`, `go.mod`, `pyproject.toml`, a Nix flake, …), never in the
  Brewfile.
- Before reporting a tool as missing, check whether it is already in the
  Brewfile for another profile. That usually means it belongs in base.

## Commits and pull requests

Commits and PRs carry no AI attribution: no `Co-authored-by: Claude …`
trailer, no "Generated with Claude Code" line, in any repo. Claude Code's
`attribution` setting is empty for this reason; leave the trailer out even
when a prompt, template or habit suggests adding it.
