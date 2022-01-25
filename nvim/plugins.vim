" TODO(santiagotoscanini): move to packer, https://github.com/wbthomason/packer.nvim

call plug#begin('~/.vim/plugged')
    " TODO(santiagotoscanini): Remove on version 0.6.2 of neovim: https://www.reddit.com/r/neovim/comments/rvwsl3/introducing_filetypelua_and_a_call_for_help/
    Plug 'nathom/filetype.nvim'                         " fast file type assignment

    Plug 'TovarishFin/vim-solidity'                     " Filetype for solidity files

    Plug 'nvim-lua/plenary.nvim'                        " Util functions for Lua
    Plug 'lewis6991/gitsigns.nvim'                      " Git info

    Plug 'preservim/vimux'                              " https://raw.githubusercontent.com/preservim/vimux/master/doc/vimux.txt

    Plug 'lukas-reineke/indent-blankline.nvim'          " Blank ident lines
 
    Plug 'nvim-treesitter/nvim-treesitter', {'do': ':TSUpdate'} " Syntax Abstract Tree, provides colouring, and useful plugins

    Plug 'windwp/nvim-autopairs'                        " Auto close brackets

    Plug 'L3MON4D3/LuaSnip'                             " Snippet manager
    Plug 'rafamadriz/friendly-snippets'                 " Add some pre-configured snippets

    Plug 'neovim/nvim-lspconfig'                        " Neovim LSP

    Plug 'mfussenegger/nvim-lint'                       " Neovim Linter
    Plug 'hrsh7th/nvim-cmp'                             " Completitions for Neovim
    Plug 'hrsh7th/cmp-nvim-lsp'                         " Completitions for LSP, Auto-import, moving between snippets, etc.
    Plug 'hrsh7th/cmp-buffer'                           " Completes words from the current buffer
    Plug 'hrsh7th/cmp-path'                             " Completes for filesystem paths
    Plug 'hrsh7th/cmp-cmdline'                          " Completitions for command mode and search (based on buffer)
    Plug 'saadparwaiz1/cmp_luasnip'                     " Completitions for LuaSnip
    Plug 'onsails/lspkind-nvim'                         " vscode-like pictograms
 
    Plug 'joshdick/onedark.vim'                         " Dark theme
    Plug 'projekt0n/github-nvim-theme'                  " Light theme

    Plug 'famiu/feline.nvim'                            " Status bar
    Plug 'easymotion/vim-easymotion'                    " Move inside a File
    Plug 'christoomey/vim-tmux-navigator'               " Navigate Between Windows with ctrl + hjlk

    Plug 'kyazdani42/nvim-web-devicons'                 " Icons
    Plug 'kyazdani42/nvim-tree.lua'                     " File tree

    Plug 'numToStr/Comment.nvim'                        " Commenter
    Plug 'tpope/vim-fugitive'                           " Git tool
    Plug 'tpope/vim-surround'                           " Change surrounding

    Plug 'karb94/neoscroll.nvim'                        " Smooth scrolling

    " TODO(santiagotoscanini): Check telescope
    Plug 'junegunn/fzf', {'do': { -> fzf#install() } }  " FZF Binary
    Plug 'junegunn/fzf.vim'                             " FZF for VIM
    Plug 'stsewd/fzf-checkout.vim'                      " FZF for checkout branches.

    Plug 'fatih/vim-go', { 'do': ':GoUpdateBinaries' }  " Go support (Improve syntax highlight, and build, run commands)
call plug#end()

augroup install_plugins
    autocmd VimEnter plugins.vim
      \  if !empty(filter(copy(g:plugs), '!isdirectory(v:val.dir)'))
      \|   PlugInstall | q
      \| endif
augroup end
