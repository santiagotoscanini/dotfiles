vim.cmd("source $XDG_CONFIG_HOME/nvim/plugins.vim")

require("nvim-autopairs").setup()
require("lsp")
require("linter")
require("snippets")

vim.cmd("source $XDG_CONFIG_HOME/nvim/style.vim")
require("nvim-tree").setup({
	view = {
		relativenumber = true,
		signcolumn = "no",
		width = 40,
	},
})
require("trouble").setup()
require("gitsigns").setup()
require("feline-config")
require("smooth-scrolling")
require("treesitter")
require("comments")

-- FIXME(santiagotoscanini): This is not working.
require("colorizer").setup({
	dart = {
		RRGGBBAA = true,
	},
})
-- https://github.com/smjonas/inc-rename.nvim

vim.cmd("source $XDG_CONFIG_HOME/nvim/config.vim")
vim.cmd("source $XDG_CONFIG_HOME/nvim/keymaps.vim")
