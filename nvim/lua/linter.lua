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
		-- JS/TS
		diagnostics.eslint,
		formatting.eslint,
		formatting.prettier.with({ -- And also HTML/CSS/YAML/MARKDOWN/JSON. Could even support Solidity with the use of extensions.
			extra_filetypes = { "solidity" },
		}),
		-- JSON
		formatting.jq,
		-- ZSH
		diagnostics.zsh,
		-- Lua
		diagnostics.luacheck,
		formatting.stylua,
		-- Solidity
		diagnostics.solhint,
		-- Vim
		diagnostics.vint,
	},
})
