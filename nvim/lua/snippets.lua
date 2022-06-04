local ls = require("luasnip")
local snip = ls.snippet
local node = ls.snippet_node
local text = ls.text_node
local insert = ls.insert_node
local func = ls.function_node
local choice = ls.choice_node
local dynamicn = ls.dynamic_node
local rep = require("luasnip.extras").rep
local fmt = require("luasnip.extras.fmt").fmt

ls.config.set_config({
	-- this tells luasnip to remember to keep around the last snippet.
	-- you can jump back into it even if you move outside of the selection.
	history = true,

	-- populate *SELECT variable
	store_selection_keys = "<c-s>",

	-- this one is cool cause if you have dynamic snippets, it updates as you type.
	updateevents = "TextChanged,TextChangedI",

	-- autosnippets:
	enable_autosnippets = true,

	-- crazy highlights
	ext_opts = {
		[choice] = {
			active = {
				virt_text = { { "<-", "Error" } },
			},
		},
	},
})

require("luasnip/loaders/from_vscode").lazy_load()
ls.filetype_extend("dart", { "flutter" })

local keymap = vim.api.nvim_set_keymap
local opts = { noremap = true, silent = true }
keymap("i", "<c-j>", "<cmd>lua require'luasnip'.jump(1)<CR>", opts)
keymap("s", "<c-j>", "<cmd>lua require'luasnip'.jump(1)<CR>", opts)
keymap("i", "<c-k>", "<cmd>lua require'luasnip'.jump(-1)<CR>", opts)
keymap("s", "<c-k>", "<cmd>lua require'luasnip'.jump(-1)<CR>", opts)

---------- SNIPPETS

local date = function()
	return { os.date("%Y-%m-%d") }
end

ls.add_snippets(nil, {
	all = {
		snip({
			trig = "meta",
			namr = "Metadata",
			dscr = "Yaml metadata format for markdown",
		}, {
			text({ "---", "title: " }),
			insert(1, "note_title"),
			text({ "", "author: " }),
			insert(2, "author"),
			text({ "", "date: " }),
			func(date, {}),
			text({ "", "categories: [" }),
			insert(3, ""),
			text({ "]", "lastmod: " }),
			func(date, {}),
			text({ "", "tags: [" }),
			insert(4),
			text({ "]", "comments: true", "---", "" }),
			insert(0),
		}),
		snip({
			trig = "link",
			namr = "markdown_link",
			dscr = "Create markdown link [txt](url)",
		}, {
			text("["),
			insert(1),
			text("]("),
			func(function(_, snip)
				return snip.env.TM_SELECTED_TEXT[1] or {}
			end, {}),
			text(")"),
			insert(0),
		}),
	},
	lua = {
		snip("req", fmt("local {} = require('{}')", { insert(1, "default"), rep(1) })),
	},
})
