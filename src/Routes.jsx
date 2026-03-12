import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Main from './pages/Main';
import About from './pages/About';

/**
 * 전역 라우팅 구성
 * @description Layout(껍데기)과 Main(메인 콘텐츠)을 매핑합니다.
 */
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Main />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
