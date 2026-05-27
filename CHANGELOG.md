# @tiny-codes/vite-plugin-qiankun

## v2.3.0

2026-5-27

### Break Changes

- The `name` parameter is now required in `exportQiankunLifeCycles`. It should match the name used in `vite.config.ts` when calling `qiankun('xxx')`.

> In previous versions, the `appName` parameter was dynamically added to the entry file, but this approach had some issues.
>
> 1. If the micro app is started in debug mode, the `appName` might not be passed to the `exportQiankunLifeCycles` method. To support local debugging of micro apps, it is still necessary to set the `exportQiankunLifeCycles#name`.
> 2. Another issue is that for micro apps with many modules, circular references may occur, where some chunks reference the entry chunk again. This type of reference does not include any suffix, and the browser treats them as two different modules. Therefore, when running the micro app independently (i.e., not as a qiankun micro app), it may lead to unexpected issues.
>
> In this version, we removed the approach of adding a dynamic `appName` parameter to the entry file. Instead, the `name` parameter must be explicitly provided when calling `exportQiankunLifeCycles`, ensuring that the micro app works correctly both independently and as a qiankun micro app.

<!-- > 在之前的版本中，是通过给入口文件添加一个动态的`appName`参数来实现的，但这样做存在一些问题,
>
> 1. 如果子应用是debug模式启动的，则appName可能无法传递到`exportQiankunLifeCycles`方法中，如果希望支持本地调试子应用，那就不得不还是需要设置`exportQiankunLifeCycles#name`
> 2. 另外一个问题是，对于某些模块比较多的子应用，可能会出现循环引用的情况，即某些chunk会再次引用入口chunk，但这种引用方式是不带任何后缀的，这两个会被浏览器当做两个不同的模块。所以，在单独运行子应用时（即不作为qiankun子应用时），可能会导致一些意料之外的问题。
>
> 所以，在这个版本中，我们去掉了给入口文件添加动态`appName`参数的做法，改为在调用`exportQiankunLifeCycles`时必须显式提供`name`参数，确保独立运行和作为qiankun子应用时都可以正常工作。 -->

## v2.2.1

2026-5-11

### Feature

- Add `name` parameter to `exportQiankunLifeCycles` to run micro apps in debug mode.
- Improve the format of preload modules code

## v2.2.0

2026-4-30

### Feature

- Mount Qiankun internal helpers to the `document` object to prevent them from being overwritten when multiple micro apps are loaded in parallel. Now multiple micro apps can be loaded simultaneously without affecting each other.
- Rename internal module `helpers.js` to `client.js`
- Add `qiankun` package to `optionalDependencies`

## v2.1.2

2026-4-29

### Feature

- Remove `window.proxy` and use `window` instead, because window is already proxied inside scripts.

### Bug Fixes

- Remove an incorrect `}` symbol

## v2.1.1

2026-4-29

### Bug Fixes

- Add client runtime timestamp to the entry script instead of a fixed server side timestamp.

## v2.1.0

2026-4-29

### Features

- Add `appName` to all internal global variables to support loading multiple micro apps simultaneously.
- Mount the Qiankun lifecycle scripts to `window` and move them from `body` to `head` to ensure they are accessible before the entry file is loaded.

### Internal Changes

- The temporary methods mounted on `window.proxy` for passing lifecycle hooks have been renamed.
- The internal naming of `window.proxy.qiankunLifeCycles` has been updated to include the application name, resulting in `window.proxy.qiankunLifeCycles_${appName}`.

## v2.0.6

2026-4-28

### Bug Fixes

- Add timestamp to the entry script to prevent caching issues.

## v2.0.5

2026-4-28

### Bug Fixes

- Remove the trailing slash in `window.proxy.__INJECTED_PUBLIC_PATH_BY_QIANKUN__`

## v2.0.4

2026-4-20

### Features

- Add `vite-plugin` keyword in package.json to improve discoverability.

## v2.0.3

2026-4-17

### Features

- Update README

## v2.0.2

2026-4-3

### Features

- Enhance module preloading to support cross-origin.
- Add `qiankun:loaded` event to notify when micro app is fully loaded.
- Add `qiankun:fetchEntryError` event to notify when fetching the entry script fails.
- Add `qiankun:runtimeError` event to notify when a runtime error occurs.

## v2.0.1

2026-4-2

### Features

- Support `development` mode by default without any configuration.

## v2.0.0

2026-4-1

### Features

- Always respect the `__INJECTED_PUBLIC_PATH_BY_QIANKUN__` to ensure correct resource loading in micro apps.
- Add `changeScriptOrigin` option to shut down the behavior.
- Always setup a dev server to enable running micro apps in development mode.

## v1.0.15

2026-4-1

forked from [https://github.com/tengmaoqing/vite-plugin-qiankun](https://github.com/tengmaoqing/vite-plugin-qiankun)
