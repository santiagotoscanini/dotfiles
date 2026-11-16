require("plugins")

if not vim.g.vscode then
	require("nvim-autopairs").setup()
	require("completion")
	require("lsp")
	require("debug-config")
	require("test-config")
	require("linter")
	require("snippets")

	vim.cmd("source $XDG_CONFIG_HOME/nvim/style.vim")
	require("ui")

	require("trouble").setup()
	require("gitsigns").setup()
	require("treesitter")
end

require("flash").setup()

vim.cmd("source $XDG_CONFIG_HOME/nvim/config.vim")
vim.cmd("source $XDG_CONFIG_HOME/nvim/keymaps.vim")
