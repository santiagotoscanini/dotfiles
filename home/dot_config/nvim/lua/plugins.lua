-- Plugins, managed by Neovim's built-in vim.pack (:help vim.pack).
-- Missing plugins are installed on startup, so a new machine needs no manual
-- step. Update with `:lua vim.pack.update()`, review, then `:write`.

local function gh(repo)
	return "https://github.com/" .. repo
end

-- Parsers must match the plugin's version, so update them with it.
-- Registered before vim.pack.add() so it also sees the first install.
vim.api.nvim_create_autocmd("PackChanged", {
	callback = function(ev)
		if ev.data.spec.name == "nvim-treesitter" and ev.data.kind == "update" then
			if not ev.data.active then
				vim.cmd.packadd("nvim-treesitter")
			end
			vim.cmd("TSUpdate")
		end
	end,
})

local plugins = {
	-- ae targets the entire content of the current buffer.
	-- ie is similar to ae, but ie does not include leading and trailing empty lines.
	gh("kana/vim-textobj-user"),
	gh("kana/vim-textobj-entire"),

	gh("tpope/vim-surround"), -- Change surrounding
	gh("folke/flash.nvim"), -- Jump to a position, and labels for f/t
}

-- To check if is in IdeaVim use `if has('ide')`
if not vim.g.vscode then
	vim.list_extend(plugins, {
		gh("nvim-lua/plenary.nvim"), -- Util functions for Lua (neotest)

		-- Editing
		gh("windwp/nvim-autopairs"), -- Auto close brackets
		{ src = gh("L3MON4D3/LuaSnip"), version = vim.version.range("2.*") }, -- Snippet manager
		gh("rafamadriz/friendly-snippets"), -- Add some pre-configured snippets
		-- Autocomplete. A release tag, so it downloads its prebuilt fuzzy matcher.
		{ src = gh("saghen/blink.cmp"), version = vim.version.range("1.*") },

		-- Code intelligence
		gh("nvim-treesitter/nvim-treesitter"), -- Installs parsers and queries
		gh("neovim/nvim-lspconfig"), -- LSP server definitions
		gh("stevearc/conform.nvim"), -- Formatter
		gh("mfussenegger/nvim-lint"), -- Linter
		gh("folke/trouble.nvim"), -- List of diagnostics

		-- Debug
		gh("nvim-neotest/nvim-nio"), -- A library for asynchronous IO
		gh("mfussenegger/nvim-dap"), -- DAP Client
		gh("rcarriga/nvim-dap-ui"), -- UI for DAP
		gh("leoluz/nvim-dap-go"), -- Go debugging through delve
		-- In case we want to persist the breakpoints we need
		-- https://github.com/Weissle/persistent-breakpoints.nvim

		-- Tests
		gh("nvim-neotest/neotest"),
		gh("nvim-neotest/neotest-jest"),
		{ src = gh("fredrikaverpil/neotest-golang"), version = vim.version.range("*") },

		-- UI
		gh("folke/snacks.nvim"), -- Picker, file tree, dashboard, smooth scroll, indent guides
		gh("folke/which-key.nvim"), -- Shows the available keymaps while typing
		gh("stevearc/oil.nvim"), -- Edit a directory like a buffer
		{ src = gh("catppuccin/nvim"), name = "catppuccin" }, -- Theme, the same one as Ghostty
		gh("nvim-lualine/lualine.nvim"), -- Status bar
		gh("lewis6991/gitsigns.nvim"), -- Git info (status bar, left bar)
		gh("nvim-mini/mini.icons"), -- Icons
	})

	-- Only load these plugins if running inside tmux session
	if vim.env.TMUX then
		vim.list_extend(plugins, {
			gh("christoomey/vim-tmux-navigator"), -- Navigate Between Windows with ctrl + hjkl
			gh("preservim/vimux"), -- Run code in another tmux pane
		})
	end
end

vim.pack.add(plugins, { confirm = false })
