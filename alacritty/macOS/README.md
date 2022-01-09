## MacOS

To compile `dark-mode-notifier.swift` run:

```shell
swiftc dark-mode-notifier.swift -o /usr/local/bin/dark-mode-notifier
```

We can test the script running:
```
dark-mode-notifier zsh $XDG_CONFIG_HOME/zsh/alacritty-theme.zsh
```

To make it to run automatically, copy the file `dark-mode-notifier.plist` to `~/Library/LaunchAgents`.
```
cp $DOTFILES_PATH/alacritty/macOS/dark-mode-notifier.plist ~/Library/LaunchAgents/dark-mode-notifier.plist
```

Then `launchctl load -w ~/Library/LaunchAgents/dark-mode-notifier.plist` will keep it running on boot.
