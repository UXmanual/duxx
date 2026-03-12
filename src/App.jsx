import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';

/**
 * 프로젝트의 루트 컴포넌트
 * @description 브라우저 라우터를 초기화하고 전체 라우팅 시스템을 로드함
 */
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
