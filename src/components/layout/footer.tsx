"use client";

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/language-context';

export function Footer() {
  const { language, isAdmin } = useLanguage();

  // Update translations for footer
  const footerTranslations = {
    aboutUs: { en: "About Us", ko: "회사 소개" },
    contact: { en: "Contact", ko: "연락하기" },
    privacy: { en: "Privacy Policy", ko: "개인정보 처리방침" },
    terms: { en: "Terms of Service", ko: "서비스 이용약관" },
    copyright: { en: "All rights reserved.", ko: "모든 권리 보유." },
    tagline: { en: "Nurturing families, one step at a time.", ko: "한 걸음씩, 가정을 키워나갑니다." }
  };

  // Use the adminTranslations for the footer text in admin pages
  const getText = (key: keyof typeof footerTranslations) => {
    if (isAdmin) {
      return footerTranslations[key].ko;
    }
    return footerTranslations[key][language];
  };
  
  return (
    <footer className="border-t border-border/40 bg-background/80 py-8 mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-4">
          <Link href="/about" className="hover:text-accent transition-colors">{getText("aboutUs")}</Link>
          <Link href="/contact" className="hover:text-accent transition-colors">{getText("contact")}</Link>
          <Link href="/privacy" className="hover:text-accent transition-colors">{getText("privacy")}</Link>
          <Link href="/terms" className="hover:text-accent transition-colors">{getText("terms")}</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} STAMP. {getText("copyright")}</p>
        <p className="mt-1">{getText("tagline")}</p>
      </div>
    </footer>
  );
}
