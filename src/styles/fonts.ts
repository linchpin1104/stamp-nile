import { Noto_Sans_KR } from 'next/font/google';

export const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '700'],  // 가중치 줄임
  display: 'swap',
  variable: '--font-noto-sans',
  preload: false,  // 빌드 시 미리 로드하지 않음
}); 