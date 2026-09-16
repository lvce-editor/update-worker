# Update Worker

Webworker for the update functionality in LVCE Editor.

## Emulating the current version

Set `update.emulateCurrentVersion` in LVCE Editor's `settings.json` to test update detection without installing an older build:

```json
{
  "update.emulateCurrentVersion": "0.115.14"
}
```

Update checks compare the latest GitHub release with this version. Remove the setting to use the normal application version. Empty, non-string, or malformed values also fall back to the application version; overrides must use numeric `major.minor.patch` format. The override only affects update comparisons, not the application's reported version or the selected release asset.

The host must expose `Preferences.get` and `Process.getVersion` to the worker and use `Update.getLatestVersion` for manual update detection. Both manual checks and the install flow use the override. This requires an application build containing the worker and host integration; existing installed builds do not gain the setting automatically.

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
