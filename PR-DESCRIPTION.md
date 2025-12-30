# 웹앱을 PWA(Progressive Web App)로 변환

## 📱 Summary
BookIt 웹 애플리케이션을 Progressive Web App(PWA)로 변환하여 사용자가 모바일 기기에 앱으로 설치하고 오프라인에서도 사용할 수 있도록 개선했습니다.

## ✨ 주요 변경사항

### PWA 기능 추가
- **vite-plugin-pwa** 설치 및 설정
- **앱 매니페스트** 생성 (이름, 아이콘, 테마 색상 등)
- **서비스 워커** 구현으로 오프라인 캐싱 지원
- **자동 업데이트** 기능 (새 버전 감지 시 사용자에게 알림)

### 생성된 리소스
- 📁 `/client/public/icon-192x192.png` - 192x192 앱 아이콘
- 📁 `/client/public/icon-512x512.png` - 512x512 앱 아이콘
- 📁 `/client/public/favicon.ico` - 32x32 파비콘
- 📁 `/client/public/icon.svg` - 원본 SVG 아이콘

### 코드 변경
- 📝 `vite.config.ts` - VitePWA 플러그인 설정
  - Workbox 캐싱 전략 구성
  - Google Fonts 캐싱 (1년)
  - API 응답 캐싱 (5분, NetworkFirst)
- 📝 `client/index.html` - PWA 메타 태그 추가
  - Apple 모바일 웹앱 설정
  - 테마 색상 설정
- 📝 `client/src/main.tsx` - 서비스 워커 등록
  - 자동 업데이트 핸들러
  - 오프라인 준비 상태 로깅
- 📝 `client/src/vite-env.d.ts` - TypeScript 타입 정의

## 🎯 주요 기능

1. **홈 화면에 추가**
   - iOS/Android 기기에서 "홈 화면에 추가" 가능
   - 네이티브 앱처럼 standalone 모드로 실행

2. **오프라인 지원**
   - 서비스 워커를 통한 리소스 캐싱
   - 오프라인 상태에서도 기본 기능 사용 가능

3. **성능 최적화**
   - Google Fonts 장기 캐싱 (1년)
   - API 응답 캐싱으로 빠른 로딩
   - 정적 리소스 자동 캐싱

4. **자동 업데이트**
   - 새 버전 배포 시 자동 감지
   - 사용자 확인 후 업데이트 적용

## 🧪 테스트 계획

- [ ] 프로덕션 빌드 확인
- [ ] 모바일 Chrome에서 "홈 화면에 추가" 테스트
- [ ] iOS Safari에서 "홈 화면에 추가" 테스트
- [ ] 오프라인 모드에서 앱 동작 확인
- [ ] 서비스 워커 업데이트 기능 테스트
- [ ] Lighthouse PWA 점수 확인

## 📦 Dependencies

새로 추가된 패키지:
- `vite-plugin-pwa@^1.2.0` (devDependencies)
- `sharp@^0.34.5` (devDependencies - 아이콘 생성용)

## 🚀 배포 후 확인사항

1. HTTPS 환경에서 배포되었는지 확인 (PWA는 HTTPS 필수)
2. 모바일 브라우저에서 설치 배너가 표시되는지 확인
3. Chrome DevTools > Application > Manifest 탭에서 설정 확인
4. Service Worker가 정상 등록되었는지 확인
