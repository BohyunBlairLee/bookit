# 웹앱을 PWA로 변환 및 iOS/Android 앱스토어 배포 지원

## 📱 Summary
BookIt 웹 애플리케이션을 Progressive Web App(PWA)로 변환하고, Capacitor를 사용하여 iOS App Store와 Google Play Store에 배포할 수 있는 네이티브 앱으로 변환했습니다. 이제 사용자가 모바일 기기에 앱으로 설치하고, 오프라인에서도 사용할 수 있으며, 앱스토어에서 다운로드할 수 있습니다.

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

### 네이티브 앱 변환 (Capacitor)
- **@capacitor/core, @capacitor/cli** 설치
- **@capacitor/ios** - iOS 네이티브 앱 지원
- **@capacitor/android** - Android 네이티브 앱 지원
- **capacitor.config.ts** 생성 및 구성
- iOS/Android 플랫폼 프로젝트 생성
- 네이티브 앱 아이콘 및 스플래시 스크린 자동 생성

### 생성된 네이티브 리소스
- 📁 `android/` - Android Studio 프로젝트
  - 모든 해상도별 앱 아이콘 (ldpi ~ xxxhdpi)
  - 스플래시 스크린 (가로/세로)
  - Google Play 배포용 설정
- 📁 `ios/` - Xcode 프로젝트
  - iOS 앱 아이콘 (20x20 ~ 1024x1024, 모든 스케일)
  - 스플래시 스크린
  - App Store 배포용 설정
- 📁 `resources/` - 원본 리소스 파일

### 빌드 스크립트 추가
- `npm run cap:sync` - 웹 빌드 후 네이티브 동기화
- `npm run cap:open:ios` - Xcode 열기
- `npm run cap:open:android` - Android Studio 열기
- `npm run cap:build:android` - Android Release APK/AAB 빌드
- `npm run cap:build:ios` - iOS 빌드 준비
- `npm run generate:icons` - 네이티브 아이콘 재생성

## 📦 Dependencies

새로 추가된 패키지:

**PWA:**
- `vite-plugin-pwa@^1.2.0` (devDependencies)
- `sharp@^0.34.5` (devDependencies - 아이콘 생성용)

**네이티브 앱:**
- `@capacitor/core@^8.0.0`
- `@capacitor/cli@^8.0.0`
- `@capacitor/ios@^8.0.0`
- `@capacitor/android@^8.0.0`

## 🚀 배포 후 확인사항

**PWA (웹):**
1. HTTPS 환경에서 배포되었는지 확인 (PWA는 HTTPS 필수)
2. 모바일 브라우저에서 설치 배너가 표시되는지 확인
3. Chrome DevTools > Application > Manifest 탭에서 설정 확인
4. Service Worker가 정상 등록되었는지 확인

**앱스토어 배포:**
1. **상세 가이드**: `APP-STORE-DEPLOYMENT.md` 파일 참조
2. **Android (Google Play)**:
   - Developer 계정 필요 ($25 일회성)
   - 앱 서명 키 생성
   - AAB 파일 빌드 및 업로드
   - 심사 1-3일 소요
3. **iOS (App Store)**:
   - Developer 계정 필요 ($99/년)
   - macOS 및 Xcode 필요
   - 앱 아카이브 및 업로드
   - 심사 1-2주 소요

## 📖 문서

- **APP-STORE-DEPLOYMENT.md**: 앱스토어 배포 완벽 가이드
  - 계정 생성 방법
  - 앱 서명 및 빌드
  - Play Store / App Store 제출 절차
  - 스크린샷 가이드
  - 문제 해결 방법
