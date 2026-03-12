import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Home from '../pages/Home';
import Showcase from '../pages/Showcase';
import About from '../pages/About';

/**
 * 전역 라우팅 구성
 * @description 모든 URL 경로와 컴포넌트 간의 매핑을 정의함
 */
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="showcase" element={<Showcase />} />
        <Route path="about" element={<About />} />
        {/* 추가적인 서브 페이지는 여기에 등록 */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
