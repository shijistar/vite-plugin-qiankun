import type { Element } from 'domhandler';

export function detectIndent(html: string, entryScript: Element | undefined) {
  let baseIndent = '';
  if (entryScript?.sourceCodeLocation) {
    const newline = html.includes('\r\n') ? '\r\n' : '\n';
    const lines = html.split(newline);
    const lineStr = lines[entryScript.sourceCodeLocation.startLine - 1];
    if (lineStr) {
      const startTag = '<script';
      const tagNameFromHtml = lineStr.substring(
        entryScript.sourceCodeLocation.startCol - 1,
        entryScript.sourceCodeLocation.startCol - 1 + startTag.length,
      );
      if (tagNameFromHtml === startTag) {
        for (let i = 0; i < entryScript.sourceCodeLocation.startCol - 1; i++) {
          if (/\s/.test(lineStr[i])) {
            baseIndent += lineStr[i];
          } else {
            break;
          }
        }
      }
    }
  }
  return baseIndent;
}

export function space(num: number) {
  return new Array(num + 1).join(' ');
}

export function normalizeUrl(url: string | undefined, options?: { changeScriptOrigin?: boolean }) {
  const { changeScriptOrigin = true } = options ?? {};
  let appendBase = "''";
  if (changeScriptOrigin) {
    appendBase = "window.proxy?.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ || ''";
  }
  return url?.match(/^https?/i) ? `'${url}'` : `(${appendBase}) + '${url}'`;
}
