vim.cmd("source $XDG_CONFIG_HOME/nvim/plugins.vim")

require("nvim-autopairs").setup()
require("nvim-cmp")
require("lsp")
require("indent-blankline")
require("linter")
require("snippets")

vim.cmd("source $XDG_CONFIG_HOME/nvim/style.vim")

require("nvim-tree-config")
require("trouble").setup()
require("gitsigns").setup()
require("feline-config")
require("smooth-scrolling")
require("treesitter")
require("comments")

-- TODO(santiagotoscanini): check - https://github.com/smjonas/inc-rename.nvim
require("renamer").setup()

-- FIXME(santiagotoscanini): This is not working.
-- require("colorizer").setup({
-- 	dart = {
-- 		RRGGBBAA = true,
-- 	},
-- })

vim.cmd("source $XDG_CONFIG_HOME/nvim/config.vim")
vim.cmd("source $XDG_CONFIG_HOME/nvim/keymaps.vim")
