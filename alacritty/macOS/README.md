## MacOS

To compile `dark-mode-notifier.swift` run:

```shell
swiftc dark-mode-notifier.swift -o /usr/local/bin/dark-mode-notifier
```

Then move the file `dark-mode-notifier.plist` to:
```
~/Library/LaunchAgents
```

Then `launchctl load -w ~/Library/LaunchAgents/dark-mode-notifier.plist` will keep it running on boot.
