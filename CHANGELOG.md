# @tiny-codes/vite-plugin-qiankun

## v2.1.2

2024-4-29

### Feature

- Remove `window.proxy` and use `window` instead, because window is already proxied inside scripts.

### Bug Fixes

- Remove an incorrect `}` symbol

## v2.1.1

2024-4-29

### Bug Fixes

- Add client runtime timestamp to the entry script instead of a fixed server side timestamp.

## v2.1.0

2024-4-29

### Features

- Add `appName` to all internal global variables to support loading multiple micro apps simultaneously.
- Mount the Qiankun lifecycle scripts to `window` and move them from `body` to `head` to ensure they are accessible before the entry file is loaded.

### Internal Changes

- The temporary methods mounted on `window.proxy` for passing lifecycle hooks have been renamed.
- The internal naming of `window.proxy.qiankunLifeCycles` has been updated to include the application name, resulting in `window.proxy.qiankunLifeCycles_${appName}`.

## v2.0.6

2024-4-28

### Bug Fixes

- Add timestamp to the entry script to prevent caching issues.

## v2.0.5

2024-4-28

### Bug Fixes

- Remove the trailing slash in `window.proxy.__INJECTED_PUBLIC_PATH_BY_QIANKUN__`

## v2.0.4

2024-4-20

### Features

- Add `vite-plugin` keyword in package.json to improve discoverability.

## v2.0.3

2024-4-17

### Features

- Update README

## v2.0.2

2024-4-3

### Features

- Enhance module preloading to support cross-origin.
- Add `qiankun:loaded` event to notify when micro app is fully loaded.
- Add `qiankun:fetchEntryError` event to notify when fetching the entry script fails.
- Add `qiankun:runtimeError` event to notify when a runtime error occurs.

## v2.0.1

2024-4-2

### Features

- Support `development` mode by default without any configuration.

## v2.0.0

2024-4-1

### Features

- Always respect the `__INJECTED_PUBLIC_PATH_BY_QIANKUN__` to ensure correct resource loading in micro apps.
- Add `changeScriptOrigin` option to shut down the behavior.
- Always setup a dev server to enable running micro apps in development mode.

## v1.0.15

2024-4-1

forked from [https://github.com/tengmaoqing/vite-plugin-qiankun](https://github.com/tengmaoqing/vite-plugin-qiankun)
