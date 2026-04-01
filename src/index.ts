import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { PluginOption } from 'vite';
import { detectIndent, space } from './utils';

export * from './helper';

export interface MicroOption {
  /**
   * Whether to change the origin of entry script tag for micro frontend. It's useful when the micro
   * frontend is deployed on a different domain or path.
   *
   * > If the origin by the qiankun's default algorithm is not correct for you, please try the
   * > [getPublicPath](https://qiankun.umijs.org/zh/api) option.
   *
   * @default true
   */
  changeScriptOrigin?: boolean;
}
type PluginFn = (appName: string, pluginOptions?: MicroOption) => PluginOption;

/**
 * Vite plugin for integrating with Qiankun micro frontend.
 *
 * @param appName The name of the Qiankun sub app.
 * @param pluginOptions Options for configuring the micro frontend behavior.
 *
 * > If the micro app is deployed on a different domain or path, you may need to adjust the public
 *   > path. Please have a look at the [getPublicPath](https://qiankun.umijs.org/zh/api) option.
 *
 * @returns A Vite plugin option object.
 */
const qiankunPlugin: PluginFn = (appName, pluginOptions = {}) => {
  const { changeScriptOrigin = true } = pluginOptions;

  return {
    name: 'vite-plugin-qiankun',

    transformIndexHtml(html: string, context) {
      const $ = load(html, { sourceCodeLocationInfo: true });
      const entryScript =
        $('script[entry]').get(0) ?? $('body script[type=module], head script[crossorigin=""]').get(0);
      if (entryScript) {
        const scriptBaseIndent = detectIndent(html, entryScript);
        const S0 = scriptBaseIndent;
        const S1 = scriptBaseIndent + space(2);
        const S2 = S1 + space(2);
        const script$ = module2DynamicImport({
          $,
          scriptTag: entryScript,
          changeScriptOrigin,
          ident: S1,
        });
        script$?.html(`${script$.html()?.trimEnd()}.finally(() => {
${S2}${createImportFinallyResolve(appName, { indent: S2 }).trim()}
${S1}});
${S0}`);

        const bodyBaseIndent = detectIndent(html, $('body').get(0));
        const B1 = bodyBaseIndent + space(2);
        const B2 = B1 + space(2);
        $('body').append(`
${B1}<script>
${B2}${createQiankunHelper(appName, { indent: B2 + space(2) }).trim()}
${B1}</script>
`);
        const output = $.html();
        return output;
      } else {
        console.warn('\x1b[33m%s\x1b[0m', '⚠️ Patch for qiankun failed, because the entry script was not found.');
        return html;
      }
    },
    configureServer(server) {
      const base = server.config.base;
      return () => {
        const patchFiles = [`${base}@vite/client`];
        patchFiles.forEach((file) => {
          server.middlewares.use(file, (req, res, next) => {
            const end = res.end.bind(res);
            res.end = function (this: typeof res, chunk: unknown, ...rest: any[]) {
              if (typeof chunk === 'string') {
                const $ = load(chunk);
                module2DynamicImport({ $, scriptTag: $(`script[src="${file}"]`).get(0), changeScriptOrigin });
                chunk = $.html();
              }
              end(chunk, ...rest);
              return this;
            } as unknown as typeof res.end;
            next();
          });
        });
      };
    },
  };
};

function module2DynamicImport(
  options: { $: CheerioAPI; scriptTag: Element | undefined; ident?: string } & Pick<MicroOption, 'changeScriptOrigin'>,
) {
  const { $, scriptTag, changeScriptOrigin, ident = '' } = options;
  if (!scriptTag) {
    return;
  }
  const script$ = $(scriptTag);
  const moduleSrc = script$.attr('src');
  let appendBase = "''";
  if (changeScriptOrigin) {
    appendBase = "window.proxy ? window.proxy.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ || '' : ''";
  }
  script$.removeAttr('src');
  script$.removeAttr('type');
  const space = ident;
  script$.html(`
${space}const publicUrl = ${appendBase};
${space}let assetUrl = '${moduleSrc}';
${space}if (!assetUrl.match(/^https?/i)) {
${space}  assetUrl = publicUrl + assetUrl;
${space}}
${space}import(assetUrl)`);
  return script$;
}

function createImportFinallyResolve(qiankunName: string, options?: { indent?: string }) {
  const { indent: space = '      ' } = options ?? {};
  return `
${space}const qiankunLifeCycle = window.moudleQiankunAppLifeCycles && window.moudleQiankunAppLifeCycles['${qiankunName}'];
${space}if (qiankunLifeCycle) {
${space}  window.proxy.vitemount((props) => qiankunLifeCycle.mount(props));
${space}  window.proxy.viteunmount((props) => qiankunLifeCycle.unmount(props));
${space}  window.proxy.vitebootstrap(() => qiankunLifeCycle.bootstrap());
${space}  window.proxy.viteupdate((props) => qiankunLifeCycle.update(props));
${space}}
`;
}

function createQiankunHelper(qiankunName: string, options?: { indent?: string }) {
  const { indent: space = '      ' } = options ?? {};
  return `
${space}const createDeffer = (hookName) => {
${space}  const d = new Promise((resolve, reject) => {
${space}    window.proxy && (window.proxy[\`vite\${hookName}\`] = resolve)
${space}  })
${space}  return props => d.then(fn => fn(props));
${space}}
${space}const bootstrap = createDeffer('bootstrap');
${space}const mount = createDeffer('mount');
${space}const unmount = createDeffer('unmount');
${space}const update = createDeffer('update');

${space};(global => {
${space}  global.qiankunName = '${qiankunName}';
${space}  global['${qiankunName}'] = {
${space}    bootstrap,
${space}    mount,
${space}    unmount,
${space}    update
${space}  };
${space}})(window);
`;
}

export default qiankunPlugin;
