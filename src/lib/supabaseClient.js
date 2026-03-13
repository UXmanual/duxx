import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * [Library] Supabase 전역 클라이언트
 * @description
 * 지도의 메모 데이터를 실시간으로 동기화하기 위한 백엔드 클라이언트입니다.
 * 빈 값이 들어올 경우 서버 사이드 에러 방지를 위해 조건부로 초기화합니다.
 */
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
