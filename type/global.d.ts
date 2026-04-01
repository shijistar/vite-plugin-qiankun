declare global {
  declare interface Window {
    proxy: Window;
    moudleQiankunAppLifeCycles: Record<string, QiankunLifeCycle>;
    __POWERED_BY_QIANKUN__?: boolean;
    __INJECTED_PUBLIC_PATH_BY_QIANKUN__?: string;
  }
}

export interface QiankunProps {
  container?: HTMLElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
}

interface QiankunLifeCycle {
  bootstrap: (props?: QiankunProps) => void | Promise<void>;
  mount: (props: QiankunProps) => void | Promise<void>;
  unmount: (props: QiankunProps) => void | Promise<void>;
  update: (props: QiankunProps) => void | Promise<void>;
}
