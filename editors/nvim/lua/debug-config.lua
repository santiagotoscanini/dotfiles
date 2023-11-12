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
      processId = require 'dap.utils'.pick_process,
      cwd = "${workspaceFolder}",
    },
    {
      type = "pwa-chrome",
      request = "launch",
      name = "Start Chrome with \"localhost\"",
      url = "http://localhost:3000",
      webRoot = "${workspaceFolder}",
      userDataDir = "${workspaceFolder}/.vscode/vscode-chrome-debug-userdatadir"
    }
  }
end

require("dap-vscode-js").setup({
  node_path = "/Users/stoscanini/.asdf/shims/node",
  debugger_path = "/Users/stoscanini/.vim/plugged/nvim-dap-vscode-js",
  -- debugger_cmd = { "extension" }, -- Command to use to launch the debug server. Takes precedence over `node_path` and `debugger_path`.
  -- which adapters to register in nvim-dap
  adapters = {
      'chrome',
      'pwa-node',
      'pwa-chrome',
      'pwa-msedge',
      'node-terminal',
      'pwa-extensionHost',
      'node',
      'chrome',
  },
  -- log_file_path = "(stdpath cache)/dap_vscode_js.log" -- Path for file logging
  -- log_file_level = false -- Logging level for output to file. Set to false to disable file logging.
  -- log_console_level = vim.log.levels.ERROR -- Logging level for output to console. Set to false to disable console output.
})

dap.listeners.after.event_initialized["dapui_config"] = function()
  dapui.open({})
end
dap.listeners.before.event_terminated["dapui_config"] = function()
  dapui.close({})
end
dap.listeners.before.event_exited["dapui_config"] = function()
  dapui.close({})
end

