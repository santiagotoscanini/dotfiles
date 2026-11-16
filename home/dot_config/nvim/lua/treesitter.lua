-- TODO(santiagotoscanini): Check if neovim comes with Treesitter installed
require("nvim-treesitter.configs").setup({
	-- https://github.com/nvim-treesitter/nvim-treesitter#supported-languages
	ensure_installed = {
		-- "c",
		"lua",
		"javascript",
		"typescript",
		"python",
		-- "solidity",
		"vim",
		-- "dart",
	},
	highlight = {
		enable = true,
	},
})

vim.o.foldmethod = "expr"
vim.o.foldexpr = "nvim_treesitter#foldexpr()"
vim.o.fillchars = "fold: "
vim.o.foldlevel = 99
