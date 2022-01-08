vim.cmd 'source ~/.config/nvim/plugins.vim'
-- TODO(santiagotoscanini): When plugins are migrated to packer, this could go inside plugins.lua
require('nvim-autopairs').setup()
require('gitsigns').setup()
require('nvim-tree').setup()
-- TODO(santiagotoscanini): Delete this in version 0.6.2 of neovim if filetype.lua is stable enough
require("filetype").setup({})

vim.cmd 'source ~/.config/nvim/style.vim'
require('feline').setup() -- Needs to be below style.vim call

require('lsp-and-snippets')
require('lsp-lint')
require('comments')
require('treesitter')
require('smooth-scrolling')

vim.cmd 'source ~/.config/nvim/config.vim'
vim.cmd 'source ~/.config/nvim/keymaps.vim'
