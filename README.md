# Update Worker

Webworker for the update functionality in LVCE Editor.

## Contributing

```sh
git clone git@github.com:lvce-editor/update-worker.git &&
cd update-worker &&
npm ci &&
npm test
```

## macOS updates

The worker selects the release DMG matching the app's architecture, downloads it, and verifies its size and GitHub SHA-256 digest before writing it through the existing filesystem RPC. It then asks the host's small native helper to stage and validate the bundle. Install Update and Restart are separate confirmations; cancelling Restart leaves the app running. The Windows NSIS path remains in place.

The host must expose `AutoUpdater.getPlatform`, `Process.getArch`, `AutoUpdater.stageMacUpdate`, and `AutoUpdater.restartMacUpdate`. Installation errors are returned to the host for notification. A release without the requested architecture or checksum is rejected. The native helper and host wiring must ship together with this worker before the installed macOS app can use the flow.
