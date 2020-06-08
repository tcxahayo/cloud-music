//App.js
import React from 'react';
import { IconStyle } from './assets/iconfont/iconfont';
import { GlobalStyle } from './style';
import { HashRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import routes from './routes/index';
import store from './store/index';
import { Provider } from 'react-redux';

function App() {
  return (
    <Provider store={store}>
      <HashRouter>
        {/* 定义全局样式 */}
        <GlobalStyle></GlobalStyle>
        {/* 引入图标 */}
        <IconStyle></IconStyle>
        {/* renderRoutes只会渲染第一层数据 */}
        {renderRoutes(routes)}
      </HashRouter>
    </Provider>
  );
}

export default App;
