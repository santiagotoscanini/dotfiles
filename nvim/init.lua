vim.cmd 'source $XDG_CONFIG_HOME/nvim/plugins.vim'

if (not vim.g.vscode) then
    -- In VSCode, Insert mode is handled by itself
    require('nvim-autopairs').setup()
    require('lsp')
    require('linter')
    require('snippets')

    -- And UI
    vim.cmd 'source $XDG_CONFIG_HOME/nvim/style.vim'
    require('nvim-tree').setup({view = {relativenumber = true, signcolumn = "no"}})
    require('trouble').setup()
    require('gitsigns').setup()

    -- Needs to be below style.vim call
    require('feline-config')

    require('smooth-scrolling')
    require('treesitter')
end

require('comments')

vim.cmd 'source $XDG_CONFIG_HOME/nvim/config.vim'
vim.cmd 'source $XDG_CONFIG_HOME/nvim/keymaps.vim'
