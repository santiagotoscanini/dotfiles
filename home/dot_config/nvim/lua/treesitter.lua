-- nvim-treesitter only installs parsers and queries; highlighting and folding
-- are Neovim's own. Installing a parser needs the `tree-sitter` CLI.
-- https://github.com/nvim-treesitter/nvim-treesitter/blob/main/SUPPORTED_LANGUAGES.md
require("nvim-treesitter").install({
	"go",
	"gomod",
	"gosum",
	"gowork",
	"lua",
	"javascript",
	"typescript",
	"python",
	"vim",
})

-- Highlight every filetype that has a parser installed.
vim.api.nvim_create_autocmd("FileType", {
	callback = function()
		pcall(vim.treesitter.start)
	end,
})

vim.o.foldmethod = "expr"
vim.o.foldexpr = "v:lua.vim.treesitter.foldexpr()"
vim.o.fillchars = "fold: "
vim.o.foldlevel = 99
