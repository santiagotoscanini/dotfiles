import Cocoa

// To avoid a compiler warning about calling this function without saving its output
@discardableResult
func shell(_ args: [String]) -> Int32 {
    // Run another program as a subprocess.
    // https://developer.apple.com/documentation/foundation/process
    let task = Process()

    task.launchPath = "/usr/bin/env"
    task.arguments = args
    task.standardError = FileHandle.standardError
    task.standardOutput = FileHandle.standardOutput
    task.launch()
    task.waitUntilExit()

    return task.terminationStatus
}

let args = Array(CommandLine.arguments.suffix(from: 1))

// First run
shell(args)

// A notification dispatch mechanism that enables the broadcast of notifications across task boundaries.
// https://developer.apple.com/documentation/foundation/distributednotificationcenter
// https://developer.apple.com/documentation/foundation/notificationcenter/1411723-addobserver
DistributedNotificationCenter.default.addObserver(
    // Just listen for `AppleInterfaceThemeChangedNotification` notification.
    forName: Notification.Name("AppleInterfaceThemeChangedNotification"),
    object: nil,
    queue: nil
) { (notification) in shell(args) } // We run the `shell` function for every notifications received.

// Every app uses a single instance of NSApplication to control the main event loop
// https://developer.apple.com/documentation/appkit/nsapplication
NSApplication.shared.run()
