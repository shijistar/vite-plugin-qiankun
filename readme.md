## 简介

> `@tiny-codes/vite-plugin-qiankun`: 帮助应用快速接入乾坤的vite插件

- 保留vite构建es模块的优势
- 一键配置，不影响已有的vite配置
- 支持vite开发环境

Forked from [vite-plugin-qiankun](https://github.com/tengmaoqing/vite-plugin-qiankun)

## 快速开始

### 1、在 `vite.config.ts` 中安装插件

```typescript
// vite.config.ts
import qiankun from '@tiny-codes/vite-plugin-qiankun';

export default {
  // 这里的 subApp 是子应用名，主应用注册时 name 需保持一致
  plugins: [
    // ...
    qiankun('subApp'),
  ],
};
```

### 2、在入口文件里面写入乾坤的生命周期配置

```ts
// main.ts
import { qiankunWindow, exportQiankunLifeCycles } from '@tiny-codes/vite-plugin-qiankun';

const root = createRoot(document.getElementById('root'));

if (qiankunWindow.__POWERED_BY_QIANKUN__) {
  exportQiankunLifeCycles({
    bootstrap(props) {
      console.log('bootstrap');
    },
    mount(props) {
      console.log('mount');
      root.render(<App/>);
    },
    unmount(props) {
      console.log('unmount');
      root.unmount();
    },
    update(props) {
      console.log('update', props);
    }
  });
}
else {
  root.render(<App/>);
}

```

### 3、子应用部署到不同的域名

如果子应用与主应用部署的域名不同，并且子应用的`base`是相对路径（例如`/sub-app/`），此时很可能子应用会加载失败。子应用的入口 script 标签可能类似于 `/sub-app/index.js`，qiankun会尝试在主应用域名下加载该资源，当然会失败。

要解决这个问题，可以使用 [getPublicPath](https://qiankun.umijs.org/zh/api) 选项，返回子应用的域名，注意末尾不要包含`/`。

```tsx
import { loadMicroApp } from 'qiankun';

loadMicroApp(
  {
    name: 'sub-app',
    entry: `https://www.sub-app.com/path/to/page`,
  },
  {
    getPublicPath: () => `https://www.sub-app.com`,
  },
);
```

### 4、显式指定入口文件

qiankun会默认取最后一个 `script` 标签作为子应用的入口文件，但如果由于特殊原因不能把入口文件放到最后，也可以显式指定入口文件，在script标签上添加 `entry` 属性即可，详情参考[官方文档](https://qiankun.umijs.org/zh/faq)。

### 5、全局事件

本插件会在子应用加载完成后触发 `qiankun:loaded` 事件，在子应用入口脚本加载失败时触发 `qiankun:fetchEntryError` 事件，在子应用运行时发生错误时触发 `qiankun:runtimeError` 事件。可以通过监听这些事件来处理相应的逻辑，或在页面上显示相应的操作提示。

```typescript
window.addEventListener('qiankun:loaded', () => {
  console.log('The sub-application has been loaded successfully.');
});

window.addEventListener('qiankun:fetchEntryError', (event) => {
  console.error('The sub-application entry script failed to load', event.detail);
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
  console.error('The sub-application runtime error occurred', event.detail);
});
```

### 6、其它使用注意点 `qiankunWindow`

因为 esm 模块加载与`qiankun`的实现方式有些冲突，所以使用本插件实现的`qiankun`微应用里面没有运行在js沙盒中。所以在不可避免需要设置window上的属性时，尽量显式地操作js沙盒，否则可能会对其它子应用产生副作用。qiankun沙盒对象的使用方式：

```typescript
import { qiankunWindow } from '@tiny-codes/vite-plugin-qiankun';

if (qiankunWindow.__POWERED_BY_QIANKUN__) {
  console.log('I am running as a sub-application');
}
qiankunWindow.foo = 'bar';
```

## 例子

详细的信息可以参考例子里面的使用方式

```
git clone xx
npm install
npm run example:install
# 生产环境调试demo
npm run example:start
# vite开发环境demo, demo中热更新已经关闭
npm run example:start-vite-dev
```
