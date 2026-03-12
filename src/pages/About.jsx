import React from 'react';

/**
 * About 페이지
 * @description 하드코딩된 색상 클래스를 제거하고 테마 변수를 사용합니다.
 */
const About = () => {
  return (
    <div className="pt-48 pb-32 max-w-7xl mx-auto px-6 text-center">
      <h1 className="text-4xl md:text-6xl font-black text-theme-text-primary mb-8 tracking-tighter">About DUXX</h1>
      <p className="text-theme-text-secondary text-lg max-w-2xl mx-auto">
        창의적인 코딩과 최첨단 디자인의 결합. DUXX는 미래의 웹을 오늘 구현합니다.
      </p>
    </div>
  );
};

export default About;
