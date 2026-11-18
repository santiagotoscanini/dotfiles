-- Icons. Plugins that still ask for nvim-web-devicons get these instead.
require("mini.icons").setup()
MiniIcons.mock_nvim_web_devicons()

-- One plugin for the picker, file tree, dashboard, smooth scroll and indent guides.
require("snacks").setup({
	picker = { enabled = true },
	-- Oil opens directories (`nvim .`); the tree is a sidebar on <leader>e.
	explorer = { replace_netrw = false },
	dashboard = {
		preset = {
			keys = {
				{ icon = " ", key = "f", desc = "Find File", action = ":lua Snacks.dashboard.pick('files')" },
				{ icon = " ", key = "n", desc = "New File", action = ":ene | startinsert" },
				{ icon = " ", key = "g", desc = "Find Text", action = ":lua Snacks.dashboard.pick('live_grep')" },
				{ icon = " ", key = "r", desc = "Recent Files", action = ":lua Snacks.dashboard.pick('oldfiles')" },
				{
					icon = " ",
					key = "c",
					desc = "Config",
					action = ":lua Snacks.dashboard.pick('files', {cwd = vim.fn.stdpath('config')})",
				},
				{ icon = " ", key = "q", desc = "Quit", action = ":qa" },
			},
		},
		-- The default also has a "startup" section, which needs lazy.nvim.
		sections = {
			{ section = "header" },
			{ section = "keys", gap = 1, padding = 1 },
		},
	},
	scroll = { enabled = true },
	indent = { enabled = true },
})

require("oil").setup({
	-- Keep <C-t> for the global grep picker instead of "open in new tab".
	keymaps = { ["<C-t>"] = false },
})

-- Status bar, plus the file path at the top of every window.
require("lualine").setup({
	options = {
		disabled_filetypes = {
			winbar = { "snacks_dashboard", "snacks_layout_box", "snacks_picker_list", "snacks_picker_input", "oil", "help" },
		},
	},
	extensions = { "oil", "trouble", "nvim-dap-ui", "quickfix" },
	winbar = { lualine_c = { { "filename", path = 1 } } },
	inactive_winbar = { lualine_c = { { "filename", path = 1 } } },
})

-- Popup with the available keymaps after pressing a prefix such as <leader>.
require("which-key").setup()

vim.fn.sign_define("DapBreakpoint", { text = "🟥", texthl = "", linehl = "", numhl = "" })
vim.fn.sign_define("DapStopped", { text = "▶️", texthl = "", linehl = "", numhl = "" })
