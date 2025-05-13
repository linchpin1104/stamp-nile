# 모바일 최적화 가이드

이 문서는 Stamp36 애플리케이션의 모바일 최적화에 관한 가이드입니다.

## 구현된 최적화 기능

1. **모바일 감지**
   - `useIsMobile` 훅을 사용하여 모바일 장치 감지
   - 768px 미만의 화면을 모바일로 간주

2. **비디오 최적화**
   - 모바일 기기에 최적화된 비디오 URL 제공
   - 모바일에서는 자동 재생 없음
   - 최적화된 컨트롤
   - 비디오 미리보기 이미지 지원

3. **텍스트 최적화**
   - 긴 텍스트의 경우 접고 펼치기 기능
   - 모바일에서 초기에는 축약된 텍스트 표시 

4. **모바일 프로그램 뷰어**
   - 모바일에 최적화된 레이아웃 제공
   - 클릭 가능한 영역 크기 최적화
   - 아코디언 컴포넌트로 콘텐츠 접고 펼치기

5. **프로그램 데이터 최적화**
   - 모바일 환경에 맞는 메타데이터 추가
   - 오프라인 지원 및 WiFi 필요 여부 표시
   - 예상 학습 시간 계산

## 모바일 최적화 적용 방법

### 1. 프로그램 최적화
```tsx
import { enhanceProgramForMobile } from '@/lib/mobile-optimization';
import { Program } from '@/types';

const program: Program = { /* 프로그램 데이터 */ };
const optimizedProgram = enhanceProgramForMobile(program);
```

### 2. 비디오 최적화 적용
```tsx
import { VideoPlayer } from '@/components/video-player';

<VideoPlayer 
  videoContent={videoData} 
  showTitle={true}
  className="my-custom-class"
/>
```

### 3. 텍스트 최적화 적용
```tsx
import { MobileOptimizedText } from '@/components/mobile-optimized-text';

<MobileOptimizedText
  text="긴 텍스트 내용..."
  maxLength={300}
  readMoreLabel="더 보기"
  readLessLabel="접기"
/>
```

### 4. 모바일 프로그램 뷰어 적용
```tsx
import { MobileProgramViewer } from '@/components/mobile-program-viewer';
import { useProgramViewer } from '@/hooks/use-program-viewer';

// 컴포넌트 내부
const { optimizedProgram, isMobileView, toggleView } = useProgramViewer(program);

// JSX 렌더링 부분
{isMobileView ? (
  <MobileProgramViewer 
    program={optimizedProgram}
    currentWeekId={currentWeekId}
    onWeekSelect={handleWeekSelect}
  />
) : (
  <DesktopProgramViewer program={program} />
)}

<Button onClick={toggleView}>
  {isMobileView ? "데스크톱 버전 보기" : "모바일 버전 보기"}
</Button>
```

## 성능 최적화 팁

1. **이미지 최적화**
   - `next/image` 컴포넌트 사용
   - 올바른 크기의 이미지 지정 (srcset)
   - lazy loading 적용

2. **학습 요소 최적화**
   - 복잡한 인터랙티브 요소는 모바일에서 단순화
   - 무거운 컴포넌트는 지연 로딩 적용

3. **응답형 디자인**
   - Tailwind CSS의 responsive 클래스 활용
   - Media query 브레이크포인트 일관되게 적용

## 테스트

모바일 최적화를 테스트하려면:

1. Chrome DevTools 모바일 에뮬레이션 기능 사용
2. 실제 모바일 기기에서 테스트 (Android, iOS)
3. 다양한 화면 크기와 해상도에서 테스트 