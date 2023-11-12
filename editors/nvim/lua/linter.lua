local make_linter_warnings = function(diagnostic)
	diagnostic.severity = diagnostic.message:find("really") and vim.diagnostic.severity["ERROR"]
		or vim.diagnostic.severity["WARN"]
end

local null_ls = require("null-ls")
local diagnostics = null_ls.builtins.diagnostics
local formatting = null_ls.builtins.formatting

require("null-ls").setup({
	sources = {
		-- Python
		diagnostics.flake8.with({ diagnostics_postprocess = make_linter_warnings }),
		formatting.black,
		formatting.isort,

		-- JSON
		formatting.jq,
		-- JS/TS
		diagnostics.eslint,
		formatting.eslint,
		-- formatting.prettier.with({ -- Also HTML/CSS/YAML/MD/JSON/GRAPHQL. Can even support Solidity with extensions.
		-- 	extra_filetypes = { "solidity" },
		-- }),

		-- ZSH
		diagnostics.zsh,

		-- Lua
		diagnostics.luacheck,
		formatting.stylua,

		-- Solidity
		-- diagnostics.solhint,

		-- Vim
		diagnostics.vint,
	},
})
