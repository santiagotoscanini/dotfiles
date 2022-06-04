make_linter_warnings = function(diagnostic)
    diagnostic.severity = diagnostic.message:find("really")
        and vim.diagnostic.severity["ERROR"]
        or vim.diagnostic.severity["WARN"]
end


-- TODO vint, luacheck
require("null-ls").setup({
    sources = {
        require("null-ls").builtins.diagnostics.flake8.with { diagnostics_postprocess = make_linter_warnings },
        require("null-ls").builtins.formatting.black,
    },
})
