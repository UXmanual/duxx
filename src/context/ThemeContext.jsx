import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

/**
 * 테마 관리를 담당하는 전용 프로바이더
 * @description 로직 수정을 위해 UI 컴포넌트를 건드릴 필요가 없게 합니다.
 */
export const ThemeProvider = ({ children }) => {
  // 다크모드 제거: 항상 라이트 모드 고정
  const isDark = false;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  const toggleTheme = () => {
    // 테마 토글 기능 비활성화
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
