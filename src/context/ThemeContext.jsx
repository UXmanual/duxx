import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

/**
 * 테마 관리를 담당하는 전용 프로바이더
 * @description 로직 수정을 위해 UI 컴포넌트를 건드릴 필요가 없게 합니다.
 */
export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // 1. 로컬 스토리지에 사용자가 명시적으로 저장한 설정이 있는지 확인
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme === 'dark';
    }

    // 2. 저장된 설정이 없다면 현재 한국 시간(KST) 기준 자동 설정 (오후 6시 ~ 오전 6시)
    const now = new Date();
    const kstHour = (now.getUTCHours() + 9) % 24;
    return kstHour >= 18 || kstHour < 6;
  });

  // DOM 클래스 업데이트만 담당
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  // 사용자가 직접 버튼을 클릭했을 때만 localStorage에 영구 저장
  const toggleTheme = () => {
    setIsDark(prev => {
      const nextTheme = !prev;
      localStorage.setItem('theme', nextTheme ? 'dark' : 'light');
      return nextTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
