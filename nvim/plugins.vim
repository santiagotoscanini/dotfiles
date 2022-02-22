" TODO(santiagotoscanini): move to packer

call plug#begin('~/.vim/plugged')
    " All of the above should be migrated on nvim 0.7.0
    " because it will have native support, https://neovim.io/roadmap
    Plug 'nathom/filetype.nvim'
    Plug 'nvim-treesitter/nvim-treesitter', {'do': ':TSUpdate'}
    " #################################################

    " General utilities for multiple plugins
    Plug 'kyazdani42/nvim-web-devicons'                 " Icons
    Plug 'nvim-lua/plenary.nvim'                        " Util functions for Lua
    Plug 'lewis6991/gitsigns.nvim'                      " Git info
    Plug 'nvim-telescope/telescope.nvim'
    Plug 'neovim/nvim-lspconfig'                      " Neovim LSP
    Plug 'glepnir/dashboard-nvim'

    " ae targets the entire content of the current buffer.
    " ie is similar to ae, but ie does not include leading and trailing empty lines.
    " Plug 'kana/vim-textobj-entire'
    " Plug 'kana/vim-textobj-user'

    Plug 'lukas-reineke/indent-blankline.nvim'        " Blank ident lines
    Plug 'windwp/nvim-autopairs'                      " Auto close brackets

    Plug 'L3MON4D3/LuaSnip'                           " Snippet manager
    Plug 'rafamadriz/friendly-snippets'               " Add some pre-configured snippets

    Plug 'mfussenegger/nvim-lint'                     " Neovim Linter
    Plug 'hrsh7th/nvim-cmp'                           " Completitions for Neovim
    Plug 'hrsh7th/cmp-nvim-lsp'                       " Completitions for LSP, Auto-import, moving between snippets, etc.
    Plug 'hrsh7th/cmp-buffer'                         " Completes words from the current buffer
    Plug 'hrsh7th/cmp-path'                           " Completes for filesystem paths
    Plug 'hrsh7th/cmp-cmdline'                        " Completitions for command mode and search (based on buffer)
    Plug 'saadparwaiz1/cmp_luasnip'                   " Completitions for LuaSnip
    Plug 'onsails/lspkind-nvim'                       " vscode-like pictograms

    Plug 'joshdick/onedark.vim'                       " Dark theme
    Plug 'projekt0n/github-nvim-theme'                " Light theme

    Plug 'famiu/feline.nvim'                          " Status bar
    Plug 'easymotion/vim-easymotion'                  " Move inside a File
    Plug 'christoomey/vim-tmux-navigator'             " Navigate Between Windows with ctrl + hjlk
    Plug 'preservim/vimux'                            " https://raw.githubusercontent.com/preservim/vimux/master/doc/vimux.txt

    Plug 'kyazdani42/nvim-tree.lua'                  " File tree

    Plug 'numToStr/Comment.nvim'                       " Commenter
    Plug 'karb94/neoscroll.nvim'                       " Smooth scrolling
    Plug 'tpope/vim-surround'                          " Change surrounding

    " Plug 'tpope/vim-fugitive'                          " Git tool

    " Plug 'junegunn/fzf', {'do': { -> fzf#install( } }  " FZF Binary
    " Plug 'junegunn/fzf.vim'                            " FZF for VIM
    " Plug 'stsewd/fzf-checkout.vim'                     " FZF for checkout branches.

    " Language specific support
    " Plug 'fatih/vim-go', {'do':':GoUpdateBinaries'} " Go support (Improve syntax highlight, and build, run commands)
    " Plug 'TovarishFin/vim-solidity'                    " Filetype for solidity files
call plug#end()
