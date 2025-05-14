"use client";

import { useEffect } from 'react';

export function LanguageAttributeHandler() {
  useEffect(() => {
    // 기본 언어 설정
    document.documentElement.lang = 'ko';
  }, []);

  // 이 컴포넌트는 아무것도 렌더링하지 않음
  return null;
} 