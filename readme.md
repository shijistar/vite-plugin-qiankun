## 简介

> `@tiny-codes/vite-plugin-qiankun`: 帮助应用快速接入乾坤的vite插件

- 保留vite构建es模块的优势
- 一键配置，不影响已有的vite配置
- 支持vite开发环境

forked from [vite-plugin-qiankun](https://github.com/tengmaoqing/vite-plugin-qiankun)

## 快速开始

### 1、在 `vite.config.ts` 中安装插件

```typescript
// vite.config.ts
import qiankun from '@tiny-codes/vite-plugin-qiankun';

export default {
  // 这里的 'myMicroAppName' 是子应用名，主应用注册时AppName需保持一致
  plugins: [
    // ...
    qiankun('subApp'),
  ],
};
```

### 2、在入口文件里面写入乾坤的生命周期配置

```typescript
// main.ts
import { qiankunWindow, renderWithQiankun } from '@tiny-codes/vite-plugin-qiankun';

// some code
renderWithQiankun({
  mount(props) {
    console.log('mount');
    render(props);
  },
  bootstrap() {
    console.log('bootstrap');
  },
  unmount(props: any) {
    console.log('unmount');
    const { container } = props;
    const mountRoot = container?.querySelector('#root');
    ReactDOM.unmountComponentAtNode(mountRoot || document.querySelector('#root'));
  },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
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

### 5、其它使用注意点 `qiankunWindow`

因为 esm 模块加载与`qiankun`的实现方式有些冲突，所以使用本插件实现的`qiankun`微应用里面没有运行在js沙盒中。所以在不可避免需要设置window上的属性时，尽量显式地操作js沙盒，否则可能会对其它子应用产生副作用。qiankun沙盒对象的使用方式：

```typescript
import { qiankunWindow } from '@tiny-codes/vite-plugin-qiankun';

qiankunWindow.customxxx = 'ssss';

if (qiankunWindow.__POWERED_BY_QIANKUN__) {
  console.log('我正在作为子应用运行');
}
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
