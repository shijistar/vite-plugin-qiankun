# @tiny-codes/vite-plugin-qiankun

[English](./README.md) | [中文](./README.zh-CN.md) | [Changelog](./CHANGELOG.md)

## Overview

`@tiny-codes/vite-plugin-qiankun` helps Vite 8+ applications integrate with the qiankun micro frontend ecosystem with less setup overhead.

Its purpose is not to replace qiankun, but to bridge the gap between Vite's ESM-based output and qiankun's loading model, so that sub applications can keep their existing Vite project structure and development workflow as much as possible.

Key benefits:

- Integrate qiankun with minimal changes to your existing Vite config
- Keep the advantages of Vite's ESM build output
- Support development-mode debugging out of the box
- Handle entry scripts and `modulepreload` compatibility automatically
- Expose runtime events for loading feedback and error handling in the host app

> This project evolved from [vite-plugin-qiankun](https://github.com/tengmaoqing/vite-plugin-qiankun).

## When To Use It

<!-- cspell:ignore frontends -->

This plugin is a good fit when:

- Your sub application is built with Vite
- Your host application uses qiankun to manage micro frontends
- You want the sub application to run both standalone and inside qiankun
- You want to keep Vite's local development experience during integration

## Installation

```bash
npm install @tiny-codes/vite-plugin-qiankun
```

Or:

```bash
pnpm add @tiny-codes/vite-plugin-qiankun
```

```bash
yarn add @tiny-codes/vite-plugin-qiankun
```

### Version Requirements

- `vite >= 8.0.0`
- Runtime integration is based on qiankun

## Integration Flow

The recommended setup order is as follows.

### 1. Enable the plugin in your Vite config

```ts
// vite.config.ts
import qiankun from '@tiny-codes/vite-plugin-qiankun';

export default {
  plugins: [qiankun('subApp')],
};
```

Here `subApp` is the name of the micro app and must match the `name` used when the host application registers it.

If you need to adjust how resource URLs are rewritten, you can also pass a second argument:

```ts
qiankun('subApp', {
  changeScriptOrigin: true,
});
```

### 2. Export qiankun lifecycles in your entry file

The following example uses a React entry file:

```ts
// main.ts
import { createRoot } from 'react-dom/client';
import { exportQiankunLifeCycles, qiankunWindow } from '@tiny-codes/vite-plugin-qiankun';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container!);

if (qiankunWindow.__POWERED_BY_QIANKUN__) {
  exportQiankunLifeCycles({
    bootstrap(props) {
      console.log('bootstrap', props);
    },
    mount(props) {
      console.log('mount', props);
      root.render(<App />);
    },
    unmount(props) {
      console.log('unmount', props);
      root.unmount();
    },
    update(props) {
      console.log('update', props);
    },
  });
} else {
  root.render(<App />);
}
```

The important parts are:

- When running standalone, the app starts like a regular Vite project
- When running inside qiankun, the app exposes lifecycles through `exportQiankunLifeCycles`
- `qiankunWindow.__POWERED_BY_QIANKUN__` tells you whether the app is running in a micro frontend context

### 3. Register and load the micro app in the host application

This plugin only adapts the sub application side. The host application still uses qiankun's native registration and loading APIs.

If the host app and sub app are deployed on the same origin, standard qiankun registration is usually enough.

## What The Plugin Handles

To make Vite-based sub applications run more smoothly inside qiankun, the plugin automatically handles:

- Converting the entry module script into a loading pattern that works better in qiankun scenarios
- Processing `modulepreload` assets to reduce cross-origin and asset path issues
- Adding runtime handling in development mode so the sub app can be debugged directly
- Dispatching global events when the sub app loads successfully, when entry loading fails, and when runtime errors occur

In most cases, this means you do not need to manually patch build output or add extra compatibility scripts.

## API

### Default export `qiankun(appName, options?)`

```ts
import qiankun from '@tiny-codes/vite-plugin-qiankun';
```

Parameters:

- `appName: string`, the qiankun micro app name
- `options?: MicroOption`, optional plugin configuration

`MicroOption` currently provides:

```ts
interface MicroOption {
  changeScriptOrigin?: boolean;
}
```

#### `changeScriptOrigin`

- Type: `boolean`
- Default: `true`

When enabled, the plugin prefers qiankun's injected public path information when resolving script URLs. This is suitable for most deployment scenarios.

If your asset URLs are already fully controlled by your own application logic, or if you do not want the plugin to rewrite resource URLs, you can disable it.

### `exportQiankunLifeCycles(lifecycles)`

Used to export qiankun lifecycles from the sub application's entry file.

```ts
import { exportQiankunLifeCycles } from '@tiny-codes/vite-plugin-qiankun';
```

Supported lifecycle hooks:

- `bootstrap`
- `mount`
- `unmount`
- `update`

### `qiankunWindow`

```ts
import { qiankunWindow } from '@tiny-codes/vite-plugin-qiankun';
```

This is the unified access point for the qiankun sandbox window object in the current runtime environment. Common use cases include:

- Detecting whether the app is running inside qiankun
- Reading `__INJECTED_PUBLIC_PATH_BY_QIANKUN__`
- Explicitly attaching or reading global values when necessary

## Deployment Notes

### Same-origin deployment

If the host app and sub app are deployed under the same origin, no extra handling is usually needed.

### Cross-origin deployment

If the sub app and host app are deployed on different domains, and the sub app uses a relative `base` such as `/sub-app/`, the entry resources may be requested from the host app's origin by mistake, which will cause loading to fail.

In that case, configure qiankun's `getPublicPath` on the host side to explicitly return the sub app origin. Do not include a trailing `/`.

```ts
import { loadMicroApp } from 'qiankun';

loadMicroApp(
  {
    name: 'sub-app',
    entry: 'https://www.sub-app.com/path/to/page',
  },
  {
    getPublicPath: () => 'https://www.sub-app.com',
  },
);
```

### Explicitly mark the entry script

By default, qiankun uses the last `script` tag as the entry script. If your output structure is special and the entry script cannot be placed last, you can explicitly add the `entry` attribute to the script tag.

```html
<script type="module" src="/src/main.ts" entry></script>
```

For this kind of scenario, refer to the related section in the qiankun FAQ.

## Global Events

The plugin dispatches the following runtime events. They are useful for loading indicators, fallback handling, and monitoring in the host app:

- `qiankun:loaded`: the sub app entry and lifecycle registration are ready
- `qiankun:fetchEntryError`: the sub app entry script failed to load
- `qiankun:runtimeError`: a runtime error occurred inside the sub app

Example:

```ts
window.addEventListener('qiankun:loaded', () => {
  console.log('Sub app loaded successfully.');
});

window.addEventListener('qiankun:fetchEntryError', (event) => {
  console.error('Failed to load sub app entry script.', event.detail);
  document.querySelector('#root').innerHTML = `
If the main application is hosted on a different domain, make sure getPublicPath is configured to return the domain of sub app. For example:
<pre>
  loadMicroApp({ 
    name: "subApp", 
    entry: 'https://domain-to-subApp/pages'
  }, { 
    getPublicPath: () => "https://domain-to-subApp" 
  });
</pre>`;
});

window.addEventListener('qiankun:runtimeError', (event) => {
  console.error('Sub app runtime error.', event.detail);
});
```

If you want a clearer user-facing fallback, it is a good idea to include the failing entry URL and cross-origin guidance inside the `qiankun:fetchEntryError` handler.

## Usage Notes

### About `qiankunWindow`

Because ESM loading behavior and qiankun's implementation model do not align perfectly, micro apps integrated through this plugin do not run in the traditional JavaScript sandbox sense.

As a result, when you need to access or modify global values, it is safer to use `qiankunWindow` explicitly instead of relying directly on the raw `window` object, which helps reduce side effects on other micro apps.

```ts
import { qiankunWindow } from '@tiny-codes/vite-plugin-qiankun';

if (qiankunWindow.__POWERED_BY_QIANKUN__) {
  console.log('Current app is running inside qiankun.');
}

qiankunWindow.foo = 'bar';
```

### About development mode

The current version supports running the sub app in development mode by default, which is useful for local integration and verification.

If some HMR behavior is disabled in the example projects, that is usually done to keep the demo flow stable. It does not mean the plugin is only intended for production builds.

## Example Projects

The repository includes several examples covering different frameworks and runtime modes:

<!-- cspell:ignore viteapp vue3sub -->

- `example/main`: qiankun host application
- `example/viteapp`: Vite sub application example
- `example/react18`: React 18 sub application example
- `example/vue`: Vue sub application example
- `example/vue3sub`: Vue 3 sub application example

You can try them with:

```bash
npm install
npm run example:install
```

Start the production-style demo:

```bash
npm run example:start
```

Start the development-mode demo:

```bash
npm run example:start-vite-dev
```

## Troubleshooting Checklist

If the sub application does not load correctly, check these items first:

1. Make sure the micro app name exactly matches the name used by the host app.
2. Confirm that the entry file exports the qiankun lifecycle hooks correctly.
3. Check whether the deployment is cross-origin and `getPublicPath` is missing or incorrect.
4. Verify that the entry script is identified correctly. Add the `entry` attribute if needed.
5. Check whether `qiankun:fetchEntryError` or `qiankun:runtimeError` has been emitted in the console.

## Related Links

- [中文](./README.zh-CN.md)
- [Changelog](./CHANGELOG.md)
- [qiankun Documentation](https://qiankun.umijs.org/)
