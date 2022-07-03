call plug#begin('~/.vim/plugged')
    Plug 'nvim-lua/plenary.nvim'                      " Util functions for Lua
    Plug 'windwp/nvim-autopairs'                      " Auto close brackets
    Plug 'L3MON4D3/LuaSnip'                           " Snippet manager
    Plug 'rafamadriz/friendly-snippets'               " Add some pre-configured snippets
    Plug 'nvim-telescope/telescope.nvim'              " Explorer

    " TODO(santiagotoscanini): remove when neovim has full integration (0.7.0?)
    Plug 'nvim-treesitter/nvim-treesitter', {'do': ':TSUpdate'}

    " Fix this two:
    Plug 'folke/trouble.nvim'                         " LSP errors
    Plug 'lukas-reineke/lsp-format.nvim'              " LSP Formatter wrapper

    " LSP
    Plug 'neovim/nvim-lspconfig'                      " LSP
    " Autocomplete
    Plug 'hrsh7th/nvim-cmp'                           " Completitions for Neovim
    Plug 'hrsh7th/cmp-nvim-lua'                       " Completes Lua neovim API
    Plug 'hrsh7th/cmp-nvim-lsp'                       " Completitions for LSP, Auto-import, moving between snippets, etc.
    Plug 'hrsh7th/cmp-buffer'                         " Completes words from the current buffer
    Plug 'hrsh7th/cmp-path'                           " Completes for filesystem paths
    Plug 'hrsh7th/cmp-cmdline'                        " Completitions for command mode and search (based on buffer)
    Plug 'saadparwaiz1/cmp_luasnip'                   " Completitions for LuaSnip (snippets)
    Plug 'jose-elias-alvarez/null-ls.nvim'            " Linter and formatter
    Plug 'filipdutescu/renamer.nvim', { 'branch': 'master' }

    " Debugger
    Plug 'mfussenegger/nvim-dap'                  " Debugger
    " Plug 'leoluz/nvim-dap-go'                     " Debugger for Go
    Plug 'rcarriaga/nvim-dap-ui'                   " Debugger UI

    Plug 'github/copilot.vim'                         " GitHub Copilot

    Plug 'onsails/lspkind-nvim'                        " vscode-like pictograms for LSP
    Plug 'folke/tokyonight.nvim', { 'branch': 'main' } " Theme
    Plug 'marko-cerovac/material.nvim'                 " Theme
    Plug 'famiu/feline.nvim'                           " Status bar
    Plug 'kyazdani42/nvim-tree.lua'                    " File tree
    Plug 'karb94/neoscroll.nvim'                       " Smooth scrolling
    Plug 'lewis6991/gitsigns.nvim'                     " Git info (status bar, left bar)
    Plug 'glepnir/dashboard-nvim'                      " Dashboard while starting a new nvim session
    Plug 'lukas-reineke/indent-blankline.nvim'         " Blank ident lines
    Plug 'kyazdani42/nvim-web-devicons'                " Icons

    Plug 'fatih/vim-go', {'do':':GoUpdateBinaries'}   " Go support (Improve syntax highlight, and build, run commands)
    Plug 'TovarishFin/vim-solidity'                   " Filetype for solidity files

    " Flutter
    Plug 'thosakwe/vim-flutter'                       " Flutter suport (flutter run, flutter test, flutter pub get, etc)
    Plug 'dart-lang/dart-vim-plugin'                  " Filetype for dart files
    Plug 'norcalli/nvim-colorizer.lua'                " Colorize RGB/HEX/HSL/HSV colors

    " Only load these plugins if running inside tmux session
    if exists('$TMUX')
        Plug 'christoomey/vim-tmux-navigator'         " Navigate Between Windows with ctrl + hjlk

        Plug 'preservim/vimux'                        " Run code in another tmux pane
        Plug 'benmills/vimux-golang'                  " Vimux for golang (run current test, run current file)
        " Plug 'https://github.com/tyewang/vimux-jest-test'
    endif

    " ae targets the entire content of the current buffer.
    " ie is similar to ae, but ie does not include leading and trailing empty lines.
    Plug 'kana/vim-textobj-entire'
    Plug 'kana/vim-textobj-user'

    Plug 'easymotion/vim-easymotion'                  " Jump to a position
    Plug 'unblevable/quick-scope'                      " Show occurencies for 'f' and 't'
    Plug 'numToStr/Comment.nvim'                       " Commenter
    Plug 'tpope/vim-surround'                          " Change surrounding
call plug#end()
