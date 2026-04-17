# @tiny-codes/vite-plugin-qiankun

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
