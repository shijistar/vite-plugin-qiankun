export interface QiankunProps {
  container?: HTMLElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
}

interface QiankunLifeCycle {
  bootstrap?: (props?: QiankunProps) => void | Promise<void>;
  mount?: (props: QiankunProps) => void | Promise<void>;
  unmount?: (props: QiankunProps) => void | Promise<void>;
  update?: (props: QiankunProps) => void | Promise<void>;
}
