import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { PluginOption } from 'vite';
import { detectIndent, normalizeUrl, space } from './utils';

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

      // Transform entry script
      const entryScript =
        $('script[entry]').get(0) ?? $('body script[type=module], head script[crossorigin=""]').get(0);
      if (entryScript) {
        const url = entryScript.attribs.src;
        const scriptBaseIndent = detectIndent(html, entryScript);
        const S0 = scriptBaseIndent;
        const S1 = scriptBaseIndent + space(2);
        const script$ = module2DynamicImport({
          $,
          scriptTag: entryScript,
          appName,
          changeScriptOrigin,
          ident: S1,
        });
        script$?.html(
          `${script$.html()?.trimEnd()}.then(() => {
${S1}  if (window.proxy) {
${S1}    const hooks = window.proxy[\`qiankunLifeCycles_${appName}\`];
${S1}    if (hooks) {
${S1}      window.proxy[\`qiankun_bootstrap_${appName}\`]((props) => hooks.bootstrap && hooks.bootstrap(props));
${S1}      window.proxy[\`qiankun_mount_${appName}\`]((props) => hooks.mount && hooks.mount(props));
${S1}      window.proxy[\`qiankun_unmount_${appName}\`]((props) => hooks.unmount && hooks.unmount(props));
${S1}      window.proxy[\`qiankun_update_${appName}\`]((props) => hooks.update && hooks.update(props));
${S1}      window.dispatchEvent(new CustomEvent('qiankun:loaded'));
${S1}    }
${S1}  }
${S1}}).catch((error) => {
${S1}  console.error(error);
${S1}  if (error.name === 'TypeError' && error.message && error.message.startsWith('Failed to fetch dynamically imported module:')) {
${S1}    window.dispatchEvent(new CustomEvent('qiankun:fetchEntryError', { detail: { url: '${url}', error } }));
${S1}  } else {
${S1}    window.dispatchEvent(new CustomEvent('qiankun:runtimeError', { detail: { error } }));
${S1}  }
${S1}});
${S0}`,
        );

        // Add extra script to export lifecycles
        const bodyBaseIndent = detectIndent(html, $('head').get(0));
        const B1 = bodyBaseIndent + space(2);
        const mainModuleScript = `
${B1}<script>
${B1}  const makeLifeCycle = (hookName) => {
${B1}    const p = new Promise((resolve, reject) => {
${B1}      if (window.proxy) {
${B1}        window.proxy[\`qiankun_\${hookName}_${appName}\`] = resolve;
${B1}      }
${B1}    })
${B1}    return (props) => p.then(fn => fn(props));
${B1}  };
${B1}  window['${appName}'] = {
${B1}    bootstrap: makeLifeCycle('bootstrap'),
${B1}    mount: makeLifeCycle('mount'),
${B1}    unmount: makeLifeCycle('unmount'),
${B1}    update: makeLifeCycle('update')
${B1}  };
${B1}</script>
${S0}`;
        if (entryScript) {
          $(mainModuleScript).insertBefore(entryScript);
        } else {
          $('head').append(mainModuleScript);
        }

        // Transform modulepreload links
        const preloadLinks = $('link[rel="modulepreload"]');
        if (preloadLinks.length) {
          const urls = preloadLinks.map((_, link) => $(link).attr('href')).get();
          const P1 = detectIndent(html, preloadLinks.get(0));
          preloadLinks.last().after(`
${P1}<script>
${P1}  const preloadUrls = [
${urls.map((url) => `${P1}    ${normalizeUrl(url, { changeScriptOrigin })}`).join(',\n')}
${P1}  ];
${P1}  preloadUrls.forEach((url) => {
${P1}    const link = document.createElement('link');
${P1}    link.rel = 'modulepreload';
${P1}    link.href = url;
${P1}    link.crossOrigin = 'anonymous';
${P1}    document.head.appendChild(link);
${P1}  });
${P1}</script>`);
          const texts = preloadLinks.map((_, link) => (link.next?.type === 'text' ? link.next : null));
          texts.remove();
          preloadLinks.remove();
        }

        // Transform @react-refresh script
        if (context.server?.config.command === 'serve') {
          const scripts = $('head script[type=module]').toArray();
          const refreshScript = scripts.find((s) => /@react-refresh";$/m.test($(s).html() ?? ''));
          if (refreshScript) {
            const refreshScript$ = $(refreshScript);
            const R1 = detectIndent(html, refreshScript) + space(2);
            const content = refreshScript$.html();
            const regExp = /import\s*{([^}]*)}\s*from\s*"([^"]*@react-refresh)";/m;
            const match = content?.match(regExp);
            if (content && match) {
              const sentence = match[0];
              const imports = match[1];
              const from = match[2];
              const rest = content.replace(sentence, '');
              refreshScript$.removeAttr('type');
              refreshScript$.html(`
${R1}import(${normalizeUrl(from, { changeScriptOrigin })}).then(({${imports}}) => {
${R1}  ${rest
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean)
                .join(`\n${R1}  `)}
${R1}});`);
            }
          }
        }

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
        // Only apply to / i.e. the mount point of the app
        server.middlewares.use((req, res, next) => {
          const end = res.end.bind(res);
          res.end = function (this: typeof res, chunk: unknown, ...rest: any[]) {
            if (typeof chunk === 'string') {
              const $ = load(chunk);
              module2DynamicImport({
                $,
                appName,
                scriptTag: $(`script[src="${base}@vite/client"]`).get(0),
                changeScriptOrigin,
              });
              chunk = $.html();
            }
            end(chunk, ...rest);
            return this;
          } as unknown as typeof res.end;
          next();
        });
      };
    },
  };
};

function module2DynamicImport(
  options: {
    $: CheerioAPI;
    scriptTag: Element | undefined;
    ident?: string;
    appName: string;
  } & Pick<MicroOption, 'changeScriptOrigin'>,
) {
  const { $, scriptTag, appName, changeScriptOrigin, ident = '' } = options;
  if (!scriptTag) {
    return;
  }
  const script$ = $(scriptTag);
  const moduleSrc = script$.attr('src');
  script$.removeAttr('src');
  script$.removeAttr('type');
  const space = ident;
  script$.html(`
${space}import(${normalizeUrl(moduleSrc + `?appName=${encodeURIComponent(appName)}`, { changeScriptOrigin })} + \`&\${Date.now()}\`)`);

  return script$;
}

export default qiankunPlugin;
