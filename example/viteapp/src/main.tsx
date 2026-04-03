import React from 'react';
import ReactDOM from 'react-dom';
// vite-plugin-qiankun helper
import { exportQiankunLifeCycles, qiankunWindow } from '../../../es/helper';
import App from './App';
import './index.css';

function render(props: any) {
  const { container } = props;
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    container ? container.querySelector('#root') : document.getElementById('root'),
  );
}

exportQiankunLifeCycles({
  mount(props) {
    console.log('viteapp mount');
    render(props);
  },
  bootstrap() {
    console.log('bootstrap');
  },
  unmount(props: any) {
    console.log('viteapp unmount');
    const { container } = props;
    const mountRoot = container?.querySelector('#root');
    ReactDOM.unmountComponentAtNode(mountRoot || document.querySelector('#root'));
  },
  update(props: any) {
    console.log('viteapp update');
    console.log(props);
  },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
}
