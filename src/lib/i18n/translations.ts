export type Language = 'en' | 'ko';

export interface Translations {
  [key: string]: {
    en: string;
    ko: string;
  };
}

// Common translations used across the app
export const translations: Translations = {
  // Navigation
  "nav.home": {
    en: "Home",
    ko: "홈"
  },
  "nav.programs": {
    en: "Programs",
    ko: "프로그램"
  },
  "nav.profile": {
    en: "Profile",
    ko: "프로필"
  },
  "nav.admin": {
    en: "Admin",
    ko: "관리자"
  },
  "nav.login": {
    en: "Login",
    ko: "로그인"
  },
  "nav.register": {
    en: "Register",
    ko: "회원가입"
  },
  "nav.logout": {
    en: "Logout",
    ko: "로그아웃"
  },

  // Admin section
  "admin.dashboard": {
    en: "Dashboard",
    ko: "대시보드"
  },
  "admin.programs": {
    en: "Programs",
    ko: "프로그램 관리"
  },
  "admin.users": {
    en: "Users",
    ko: "사용자 관리"
  },
  "admin.banners": {
    en: "Banners",
    ko: "배너 관리"
  },
  "admin.vouchers": {
    en: "Vouchers",
    ko: "바우처 관리"
  },
  "admin.programProgress": {
    en: "Program Progress",
    ko: "프로그램 진행 현황"
  },
  "admin.programDiscussions": {
    en: "Program Discussions",
    ko: "프로그램 토론"
  },
  "admin.weekContent": {
    en: "Week Content",
    ko: "주차별 콘텐츠"
  },
  "admin.analytics": {
    en: "Analytics",
    ko: "분석"
  },
  
  // Form labels
  "form.email": {
    en: "Email",
    ko: "이메일"
  },
  "form.password": {
    en: "Password",
    ko: "비밀번호"
  },
  "form.confirmPassword": {
    en: "Confirm Password",
    ko: "비밀번호 확인"
  },
  "form.name": {
    en: "Name",
    ko: "이름"
  },
  "form.phoneNumber": {
    en: "Phone Number",
    ko: "전화번호"
  },
  "form.residentialArea": {
    en: "Residential Area",
    ko: "거주 지역"
  },
  "form.parentalRole": {
    en: "Parental Role",
    ko: "부모 역할"
  },
  "form.submit": {
    en: "Submit",
    ko: "제출"
  },
  "form.cancel": {
    en: "Cancel",
    ko: "취소"
  },
  "form.save": {
    en: "Save",
    ko: "저장"
  },
  "form.delete": {
    en: "Delete",
    ko: "삭제"
  },
  "form.edit": {
    en: "Edit",
    ko: "편집"
  },
  "form.create": {
    en: "Create",
    ko: "생성"
  },
  
  // Programs
  "programs.title": {
    en: "Programs",
    ko: "프로그램"
  },
  "programs.search": {
    en: "Search programs",
    ko: "프로그램 검색"
  },
  "programs.filter": {
    en: "Filter",
    ko: "필터"
  },
  "programs.sortBy": {
    en: "Sort by",
    ko: "정렬 기준"
  },
  "programs.all": {
    en: "All Programs",
    ko: "모든 프로그램"
  },
  "programs.enrolled": {
    en: "Enrolled Programs",
    ko: "등록된 프로그램"
  },
  "programs.completed": {
    en: "Completed Programs",
    ko: "완료된 프로그램"
  },
  
  // Language switcher
  "language.select": {
    en: "Language",
    ko: "언어"
  },
  "language.english": {
    en: "English",
    ko: "영어"
  },
  "language.korean": {
    en: "Korean",
    ko: "한국어"
  },
  
  // Buttons
  "button.continue": {
    en: "Continue",
    ko: "계속"
  },
  "button.back": {
    en: "Back",
    ko: "뒤로"
  },
  "button.start": {
    en: "Start",
    ko: "시작"
  },
  "button.finish": {
    en: "Finish",
    ko: "완료"
  },
  "button.enroll": {
    en: "Enroll",
    ko: "등록"
  },
  "button.view": {
    en: "View",
    ko: "보기"
  },
  "button.apply": {
    en: "Apply",
    ko: "적용"
  },
  
  // Admin form labels and table headers
  "admin.table.title": {
    en: "Title",
    ko: "제목"
  },
  "admin.table.description": {
    en: "Description",
    ko: "설명"
  },
  "admin.table.status": {
    en: "Status",
    ko: "상태"
  },
  "admin.table.actions": {
    en: "Actions",
    ko: "작업"
  },
  "admin.table.createdAt": {
    en: "Created At",
    ko: "생성일"
  },
  "admin.table.updatedAt": {
    en: "Updated At",
    ko: "수정일"
  },
  "admin.table.id": {
    en: "ID",
    ko: "ID"
  },
  "admin.table.email": {
    en: "Email",
    ko: "이메일"
  },
  "admin.table.name": {
    en: "Name",
    ko: "이름"
  }
};

// Helper function to get translation
export const getTranslation = (key: string, lang: Language = 'en'): string => {
  const translation = translations[key];
  if (!translation) return key;
  return translation[lang] || key;
};

// Admin-specific translations (always in Korean)
export const adminTranslations: { [key: string]: string } = {
  "admin.dashboard": "대시보드",
  "admin.programs": "프로그램 관리",
  "admin.users": "사용자 관리",
  "admin.banners": "배너 관리",
  "admin.vouchers": "바우처 관리",
  "admin.programProgress": "프로그램 진행 현황",
  "admin.programDiscussions": "프로그램 토론",
  "admin.weekContent": "주차별 콘텐츠",
  "admin.analytics": "분석",
  
  // Program management
  "admin.programs.title": "프로그램 관리",
  "admin.programs.create": "새 프로그램 만들기",
  "admin.programs.edit": "프로그램 편집",
  "admin.programs.details": "프로그램 세부 정보",
  "admin.programs.delete": "프로그램 삭제",
  "admin.programs.table.title": "제목",
  "admin.programs.table.slug": "슬러그",
  "admin.programs.table.status": "상태",
  "admin.programs.table.weeks": "주차 수",
  "admin.programs.table.created": "생성일",
  "admin.programs.table.actions": "작업",
  
  // User management
  "admin.users.title": "사용자 관리",
  "admin.users.create": "새 사용자 추가",
  "admin.users.edit": "사용자 편집",
  "admin.users.details": "사용자 세부 정보",
  "admin.users.delete": "사용자 삭제",
  "admin.users.table.name": "이름",
  "admin.users.table.email": "이메일",
  "admin.users.table.role": "역할",
  "admin.users.table.status": "상태",
  "admin.users.table.created": "가입일",
  "admin.users.table.lastLogin": "마지막 로그인",
  "admin.users.table.actions": "작업",
  
  // Banner management
  "admin.banners.title": "배너 관리",
  "admin.banners.create": "새 배너 만들기",
  "admin.banners.edit": "배너 편집",
  "admin.banners.delete": "배너 삭제",
  "admin.banners.table.title": "제목",
  "admin.banners.table.image": "이미지",
  "admin.banners.table.linkUrl": "링크 URL",
  "admin.banners.table.startDate": "시작일",
  "admin.banners.table.endDate": "종료일",
  "admin.banners.table.status": "상태",
  "admin.banners.table.actions": "작업",
  
  // Form labels
  "admin.form.title": "제목",
  "admin.form.description": "설명",
  "admin.form.slug": "슬러그",
  "admin.form.status": "상태",
  "admin.form.image": "이미지",
  "admin.form.content": "콘텐츠",
  "admin.form.save": "저장",
  "admin.form.cancel": "취소",
  "admin.form.delete": "삭제",
  
  // Status values
  "admin.status.active": "활성",
  "admin.status.inactive": "비활성",
  "admin.status.draft": "초안",
  "admin.status.published": "게시됨",
  "admin.status.archived": "보관됨"
}; 