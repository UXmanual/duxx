import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Main from '../components/Main';
import Home from '../pages/Home';
import About from '../pages/About';

/**
 * 전역 라우팅 구성
 * @description 모든 URL 경로와 컴포넌트 간의 매핑을 정의함
 */
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Main />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
