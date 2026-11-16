require("neotest").setup({
	adapters = {
		require("neotest-golang")({
			-- gotestsum writes results to a file, which is more reliable than
			-- parsing `go test` output.
			runner = vim.fn.executable("gotestsum") == 1 and "gotestsum" or "go",
		}),
		require("neotest-jest")({
			-- jestCommand = "npm run test --",
			-- jestConfigFile = "custom.jest.config.ts",
			-- env = { CI = true },
			-- cwd = function()
			-- 	return vim.fn.getcwd()
			-- end,
		}),
	},
})
