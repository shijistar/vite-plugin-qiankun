import { App, createApp } from 'vue';
import { exportQiankunLifeCycles, qiankunWindow } from '../../../es/helper';
import app from './App.vue';

let root: App;

function render(props: any) {
  const { container } = props;
  root = createApp(app);
  const c = container ? container.querySelector('#app') : document.getElementById('app');
  root.mount(c);
}

console.log(3333);

exportQiankunLifeCycles({
  mount(props) {
    console.log('vue3sub mount');
    render(props);
  },
  bootstrap() {
    console.log('bootstrap');
  },
  unmount(props: any) {
    console.log('vue3sub unmount');
    root.unmount();
  },
  update(props: any) {
    console.log('vue3sub update');
    console.log(props);
  },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
}
