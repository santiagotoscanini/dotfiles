call plug#begin('~/.vim/plugged')
    " To check if is in IdeaVim use `if has('ide)`
    if !exists('g:vscode')
        " Insert mode in VSCode is handled by itself, so this plugins aren't necessaries.
        Plug 'windwp/nvim-autopairs'                      " Auto close brackets
        Plug 'L3MON4D3/LuaSnip'                           " Snippet manager
        Plug 'rafamadriz/friendly-snippets'               " Add some pre-configured snippets

        " Also LSP is used by VSCode
        Plug 'neovim/nvim-lspconfig'                      " Neovim LSP
        Plug 'onsails/lspkind-nvim'                       " vscode-like pictograms
        Plug 'mfussenegger/nvim-lint'                     " Neovim Linter
        " Autocomplete
        Plug 'hrsh7th/nvim-cmp'                           " Completitions for Neovim
        Plug 'hrsh7th/cmp-nvim-lsp'                       " Completitions for LSP, Auto-import, moving between snippets, etc.
        Plug 'hrsh7th/cmp-nvim-lua'                       " Completes Lua neovim API
        Plug 'hrsh7th/cmp-buffer'                         " Completes words from the current buffer
        Plug 'hrsh7th/cmp-path'                           " Completes for filesystem paths
        Plug 'hrsh7th/cmp-nvim-lua'                       " Completes for filesystem paths
        Plug 'hrsh7th/cmp-cmdline'                        " Completitions for command mode and search (based on buffer)
        Plug 'saadparwaiz1/cmp_luasnip'                   " Completitions for LuaSnip


        " And UI...
        Plug 'joshdick/onedark.vim'                       " Dark theme
        Plug 'projekt0n/github-nvim-theme'                " Light theme
        Plug 'famiu/feline.nvim'                          " Status bar
        Plug 'kyazdani42/nvim-tree.lua'                   " File tree
        Plug 'karb94/neoscroll.nvim'                      " Smooth scrolling
        Plug 'lewis6991/gitsigns.nvim'                    " Git info
        Plug 'glepnir/dashboard-nvim'
        Plug 'lukas-reineke/indent-blankline.nvim'        " Blank ident lines
        Plug 'kyazdani42/nvim-web-devicons'               " Icons

        Plug 'nvim-telescope/telescope.nvim'

        " TODO(santiagotoscanini): remove in neovim 0.7.0
        Plug 'nvim-treesitter/nvim-treesitter', {'do': ':TSUpdate'}

        " And git
        " Plug 'tpope/vim-fugitive'                         " Git tool

        " And language specific support
        Plug 'fatih/vim-go', {'do':':GoUpdateBinaries'}   " Go support (Improve syntax highlight, and build, run commands)
        Plug 'TovarishFin/vim-solidity'                   " Filetype for solidity files
        Plug 'dart-lang/dart-vim-plugin'
        Plug 'thosakwe/vim-flutter'

        " Only load these plugins if running inside tmux session
        if exists('$TMUX')
            Plug 'christoomey/vim-tmux-navigator'             " Navigate Between Windows with ctrl + hjlk
            Plug 'preservim/vimux'                            " https://raw.githubusercontent.com/preservim/vimux/master/doc/vimux.txt
            Plug 'benmills/vimux-golang'
            " Plug 'https://github.com/tyewang/vimux-jest-test'
        endif

        Plug 'easymotion/vim-easymotion'
    else
        Plug 'asvetliakov/vim-easymotion', { 'as': 'vsc-easymotion' }
    endif

    Plug 'nvim-lua/plenary.nvim'                      " Util functions for Lua

    " ae targets the entire content of the current buffer.
    " ie is similar to ae, but ie does not include leading and trailing empty lines.
    Plug 'kana/vim-textobj-entire'
    Plug 'kana/vim-textobj-user'

    Plug 'unblevable/quick-scope'                      " Show occurencies for 'f' and 't'
    Plug 'numToStr/Comment.nvim'                       " Commenter
    Plug 'tpope/vim-surround'                          " Change surrounding
call plug#end()
