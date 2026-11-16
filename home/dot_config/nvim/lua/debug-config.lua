local dap, dapui = require("dap"), require("dapui")
dapui.setup()

local js_based_languages = { "typescript", "javascript", "typescriptreact" }

for _, language in ipairs(js_based_languages) do
	dap.configurations[language] = {
		{
			type = "pwa-node",
			request = "launch",
			name = "Launch file",
			program = "${file}",
			cwd = "${workspaceFolder}",
		},
		{
			type = "pwa-node",
			request = "attach",
			name = "Attach",
			processId = require("dap.utils").pick_process,
			cwd = "${workspaceFolder}",
		},
		{
			type = "pwa-chrome",
			request = "launch",
			name = 'Start Chrome with "localhost"',
			url = "http://localhost:3000",
			webRoot = "${workspaceFolder}",
			userDataDir = "${workspaceFolder}/.vscode/vscode-chrome-debug-userdatadir",
		},
	}
end

-- The adapter is Microsoft's vscode-js-debug, run directly by nvim-dap.
-- Download js-debug-dap-*.tar.gz from its GitHub releases and extract it into
-- $DEV_DIR/utils (it unpacks to a js-debug folder).
for _, adapter in ipairs({ "pwa-node", "pwa-chrome" }) do
	dap.adapters[adapter] = {
		type = "server",
		host = "localhost",
		port = "${port}",
		executable = {
			command = "node",
			args = { vim.fn.expand("$DEV_DIR/utils/js-debug/src/dapDebugServer.js"), "${port}" },
		},
	}
end

-- Go: adapter and launch configurations for delve, plus "debug this test".
require("dap-go").setup()

dap.listeners.after.event_initialized["dapui_config"] = function()
	dapui.open({})
end
dap.listeners.before.event_terminated["dapui_config"] = function()
	dapui.close({})
end
dap.listeners.before.event_exited["dapui_config"] = function()
	dapui.close({})
end
