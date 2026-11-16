require("blink.cmp").setup({
	-- "enter": <CR> accepts, <C-Space> opens the menu or its docs, <C-e> hides,
	-- <C-n>/<C-p> or arrows select, <C-b>/<C-f> scroll the docs.
	keymap = {
		preset = "enter",
		-- Tab moves through the menu when it is open, else through the snippet.
		-- <CR> accepts the selected item, or the first one when none is selected.
		["<CR>"] = { "select_and_accept", "fallback" },
		["<Tab>"] = { "select_next", "snippet_forward", "fallback" },
		["<S-Tab>"] = { "select_prev", "snippet_backward", "fallback" },
	},
	snippets = { preset = "luasnip" },
	sources = {
		default = { "lsp", "path", "snippets", "buffer" },
		providers = {
			buffer = { min_keyword_length = 5 },
		},
	},
	completion = {
		ghost_text = { enabled = true },
	},
	-- In the command line, show the menu while typing; <Tab> walks through it.
	cmdline = {
		completion = { menu = { auto_show = true } },
	},
})
