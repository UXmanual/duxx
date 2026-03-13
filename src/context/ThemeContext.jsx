import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

/**
 * 테마 관리를 담당하는 전용 프로바이더
 * @description 로직 수정을 위해 UI 컴포넌트를 건드릴 필요가 없게 합니다.
 */
export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // 1. 로컬 스토리지에 저장된 사용자 설정이 있는지 확인
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }

    // 2. 저장된 설정이 없다면 현재 한국 시간(KST) 기준 자동 설정 (오후 6시 ~ 오전 6시)
    const now = new Date();
    // Vercel 배포 환경이나 시스템 설정에 따라 UTC가 기준일 수 있으므로 KST(UTC+9) 보정
    const kstHour = (now.getUTCHours() + 9) % 24;
    return kstHour >= 18 || kstHour < 6;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
