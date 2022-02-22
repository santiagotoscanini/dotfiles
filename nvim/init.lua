vim.cmd 'source $XDG_CONFIG_HOME/nvim/plugins.vim'

-- TODO(santiagotoscanini): When plugins are migrated to packer
-- this initializations could go inside plugins.lua
require('nvim-autopairs').setup()
require('gitsigns').setup()
require('nvim-tree').setup()
require('lsp-and-snippets')
require('lsp-lint')
require('comments')
require('treesitter')
require('smooth-scrolling')

vim.cmd 'source $XDG_CONFIG_HOME/nvim/style.vim'
require('feline').setup() -- Needs to be below style.vim call
vim.cmd 'source $XDG_CONFIG_HOME/nvim/config.vim'
vim.cmd 'source $XDG_CONFIG_HOME/nvim/keymaps.vim'
