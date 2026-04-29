export interface QiankunProps {
  container?: HTMLElement;
  [x: string]: unknown;
}

export interface QiankunLifeCycle {
  bootstrap?: (props?: QiankunProps) => void | Promise<void>;
  mount?: (props: QiankunProps) => void | Promise<void>;
  unmount?: (props: QiankunProps) => void | Promise<void>;
  update?: (props: QiankunProps) => void | Promise<void>;
}

export interface QiankunWindow {
  __POWERED_BY_QIANKUN__?: boolean;
  __INJECTED_PUBLIC_PATH_BY_QIANKUN__?: string;
  qiankunLifeCycles?: QiankunLifeCycle;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const qiankunWindow: QiankunWindow = typeof window !== 'undefined' ? (window as any).proxy || window : {};

export const exportQiankunLifeCycles = (qiankunLifeCycle: QiankunLifeCycle) => {
  // The function has only one chance to execute, and the lifecycle needs to be assigned to the global scope.
  if (qiankunWindow?.__POWERED_BY_QIANKUN__) {
    let appName: string | undefined;
    try {
      appName = new URL(import.meta.url).searchParams.get('appName') ?? undefined;
    } catch (error) {
      // silent error
    }
    if (!appName) {
      console.warn(
        'Qiankun appName is not defined in the entry URL. To support multiple micro apps, please ensure the entry URL contains the appName query parameter.',
      );
    }
    qiankunWindow[`qiankunLifeCycles_${appName}`] = qiankunLifeCycle;
  }
};
