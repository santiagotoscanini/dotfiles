-- https://github.com/nvim-treesitter/nvim-treesitter#supported-languages
require'nvim-treesitter.configs'.setup {
  highlight = {
    enable = true,
  },
}

vim.o.foldmethod   = 'expr'
vim.o.foldexpr     = 'nvim_treesitter#foldexpr()'
vim.o.fillchars    = 'fold: '
vim.o.foldlevel    = 99
