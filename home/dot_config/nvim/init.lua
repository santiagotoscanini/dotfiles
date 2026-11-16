vim.cmd("source $XDG_CONFIG_HOME/nvim/plugins.vim")

if not vim.g.vscode then
	require("nvim-autopairs").setup()
	require("nvim-cmp")
	require("lsp")
	require("debug-config")
	require("test-config")
	require("linter")
	require("snippets")

	vim.cmd("source $XDG_CONFIG_HOME/nvim/style.vim")

	require("trouble").setup()
	require("gitsigns").setup()
	require("feline-config")
	require("treesitter")

	-- TODO(santiagotoscanini): check - https://github.com/smjonas/inc-rename.nvim
	require("renamer").setup()

	-- FIXME(santiagotoscanini): This is not working.
	-- require("colorizer").setup({
	-- 	dart = {
	-- 		RRGGBBAA = true,
	-- 	},
	-- })
end

require("comments")

vim.cmd("source $XDG_CONFIG_HOME/nvim/config.vim")
vim.cmd("source $XDG_CONFIG_HOME/nvim/keymaps.vim")
