[English](./README.md) | [中文](./README.zh-CN.md) | [Changelog](./CHANGELOG.md)

# @tiny-codes/vite-plugin-qiankun

![Vite compatibility](https://registry.vite.dev/api/badges?package=@tiny-codes/vite-plugin-qiankun&tool=vite)

## 简介

`@tiny-codes/vite-plugin-qiankun` 用于帮助基于 Vite 8+ 的应用以更低成本接入 qiankun 微前端体系。

它的目标不是替代 qiankun，而是补齐 Vite ESM 构建产物与 qiankun 加载机制之间的接入成本，让子应用尽量保持原有 Vite 工程结构和开发体验。

核心价值：

- 尽量少改造现有 Vite 配置即可接入 qiankun
- 保留 Vite 基于 ESM 的构建方式
- 默认支持开发模式调试子应用
- 自动处理入口脚本和 `modulepreload` 的兼容问题
- 提供运行时事件，便于宿主应用做状态提示和错误兜底

> 本项目基于 [vite-plugin-qiankun](https://github.com/tengmaoqing/vite-plugin-qiankun) 演进而来。

## 适用场景

当你满足以下条件时，这个插件会比较合适：

- 子应用基于 Vite 构建
- 主应用使用 qiankun 管理微前端
- 希望子应用既能独立运行，也能被 qiankun 挂载
- 希望在开发环境下继续使用 Vite 的本地调试能力

## 安装

```bash
npm install @tiny-codes/vite-plugin-qiankun
```

或者：

```bash
pnpm add @tiny-codes/vite-plugin-qiankun
```

```bash
yarn add @tiny-codes/vite-plugin-qiankun
```

### 版本要求

- `vite >= 8.0.0`
- 运行时接入方案基于 qiankun

## 接入流程

推荐按下面的顺序完成接入。

### 1. 在 Vite 配置中启用插件

```ts
// vite.config.ts
import qiankun from '@tiny-codes/vite-plugin-qiankun';

export default {
  plugins: [qiankun('subApp')],
};
```

其中 `subApp` 是子应用名称，必须与主应用注册该微应用时使用的 `name` 保持一致。

如果你需要调整资源地址改写行为，也可以传入第二个参数：

```ts
qiankun('subApp', {
  changeScriptOrigin: true,
});
```

### 2. 在入口文件导出 qiankun 生命周期

下面以 React 入口文件为例：

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

这一步的关键点是：

- 独立运行时，应用按普通 Vite 项目方式启动
- 作为 qiankun 子应用运行时，通过 `exportQiankunLifeCycles` 向运行时导出生命周期
- 通过 `qiankunWindow.__POWERED_BY_QIANKUN__` 判断当前是否处于微前端上下文

### 3. 在主应用中注册并加载子应用

插件只负责子应用侧的适配，主应用仍然使用 qiankun 原生能力注册或加载微应用。

如果子应用和主应用同域部署，通常按 qiankun 常规方式接入即可。

## 插件做了什么

为了让 Vite 子应用更顺畅地运行在 qiankun 中，插件会自动处理以下问题：

- 将入口模块脚本转换为更适合 qiankun 场景的动态加载形式
- 处理 `modulepreload` 资源，降低跨域和资源路径不一致带来的问题
- 在开发模式下补充运行时处理，便于直接调试子应用
- 在子应用加载成功、入口加载失败和运行时异常时派发全局事件

这意味着大部分情况下，你不需要手动修改打包产物或额外插入兼容脚本。

## API

### 默认导出 `qiankun(appName, options?)`

```ts
import qiankun from '@tiny-codes/vite-plugin-qiankun';
```

参数说明：

- `appName: string`，qiankun 子应用名称
- `options?: MicroOption`，插件可选配置

`MicroOption` 当前包含以下配置：

```ts
interface MicroOption {
  changeScriptOrigin?: boolean;
}
```

#### `changeScriptOrigin`

- 类型：`boolean`
- 默认值：`true`

默认开启后，插件会优先结合 qiankun 注入的公共路径信息处理脚本地址，适合绝大多数子应用部署场景。

如果你的资源路径已经完全由业务侧控制，或者不希望插件改写资源地址，可以将其关闭。

### `exportQiankunLifeCycles(lifecycles)`

用于在子应用入口处导出 qiankun 生命周期。

```ts
import { exportQiankunLifeCycles } from '@tiny-codes/vite-plugin-qiankun';
```

支持的生命周期包括：

- `bootstrap`
- `mount`
- `unmount`
- `update`

### `qiankunWindow`

```ts
import { qiankunWindow } from '@tiny-codes/vite-plugin-qiankun';
```

这是对当前运行环境中 qiankun 沙盒窗口对象的统一访问入口。常见用途包括：

- 判断是否运行在 qiankun 环境中
- 读取 `__INJECTED_PUBLIC_PATH_BY_QIANKUN__`
- 在确有需要时显式挂载或读取全局变量

## 部署说明

### 同域部署

如果主应用和子应用部署在同一域名下，通常不需要额外处理，按常规 qiankun 方式注册即可。

### 跨域部署

如果子应用与主应用部署在不同域名下，并且子应用的 `base` 使用相对路径，例如 `/sub-app/`，那么子应用入口资源可能会被错误地从主应用域名下拉取，最终导致加载失败。

推荐在主应用侧通过 qiankun 的 `getPublicPath` 显式指定子应用资源域名，返回值末尾不要带 `/`。

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

### 显式指定入口脚本

qiankun 默认会选择最后一个 `script` 标签作为入口脚本。如果你的构建产物或页面结构较特殊，无法保证入口脚本位于最后，可以在入口脚本上显式添加 `entry` 属性。

```html
<script type="module" src="/src/main.ts" entry></script>
```

这类场景可以参考 qiankun 官方 FAQ 中关于入口识别的说明。

## 全局事件

插件会在运行时触发以下事件，适合用于宿主应用的加载提示、容错提示和监控埋点：

- `qiankun:loaded`：子应用入口与生命周期注册完成
- `qiankun:fetchEntryError`：子应用入口脚本加载失败
- `qiankun:runtimeError`：子应用运行时抛出异常

示例：

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

如果你需要给用户更明确的提示，建议在 `qiankun:fetchEntryError` 中额外输出当前入口地址和跨域配置建议。

## 使用注意事项

### 关于 `qiankunWindow`

由于 ESM 模块加载方式与 qiankun 的实现机制之间存在差异，使用本插件接入后的微应用并不运行在传统意义上的 JavaScript 沙盒中。

因此，当你必须访问或修改全局对象时，建议优先通过 `qiankunWindow` 显式操作，而不是直接依赖原始 `window`，以减少对其他子应用的潜在副作用。

```ts
import { qiankunWindow } from '@tiny-codes/vite-plugin-qiankun';

if (qiankunWindow.__POWERED_BY_QIANKUN__) {
  console.log('Current app is running inside qiankun.');
}

qiankunWindow.foo = 'bar';
```

### 关于开发模式

当前版本默认支持开发模式下运行子应用，适合本地联调和接入验证。

如果你在示例工程中看到某些热更新能力被关闭，那通常是示例项目为了稳定演示链路而做的处理，不代表插件本身只能用于生产构建。

## 示例项目

仓库中提供了多个示例，覆盖不同框架或运行模式：

<!-- cspell:ignore viteapp vue3sub -->

- `example/main`：qiankun 主应用
- `example/viteapp`：Vite 子应用示例
- `example/react18`：React 18 子应用示例
- `example/vue`：Vue 子应用示例
- `example/vue3sub`：Vue 3 子应用示例

你可以通过以下命令快速体验：

```bash
npm install
npm run example:install
```

启动生产构建示例：

```bash
npm run example:start
```

启动开发模式示例：

```bash
npm run example:start-vite-dev
```

## 常见排查思路

如果子应用无法正常加载，建议优先检查下面几项：

1. 子应用名称是否与主应用注册时完全一致。
2. 入口文件是否正确导出了 qiankun 生命周期。
3. 是否存在跨域部署，但未正确配置 `getPublicPath`。
4. 页面中的入口脚本是否被错误识别，必要时可显式加上 `entry` 属性。
5. 控制台是否收到了 `qiankun:fetchEntryError` 或 `qiankun:runtimeError` 事件。
