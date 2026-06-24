# BookIt 워크플로우

기획부터 QA까지의 전체 개발 흐름을 정리한 문서입니다.

## 전체 흐름

```
Figma 기획 → Claude Code 개발 → git push → Railway 자동 배포 → TestFlight QA
```

## 1. 기획 (Figma)

- Figma에서 화면 설계 및 디자인 작업
- 완성된 디자인을 Claude Code에 전달하여 구현 요청

## 2. 개발 (Claude Code)

- Claude Code가 Figma 디자인을 기반으로 코드 작성
- `npm run dev`로 로컬에서 동작 확인
- 변경사항을 git commit

## 3. 배포 (Railway)

- `main` 브랜치에 push하면 Railway가 자동으로 배포
- 배포 과정: `npm install` → `npm run build` → `npm run start`
- 배포 완료까지 보통 1~2분 소요

## 4. QA (TestFlight)

- iOS 앱은 Capacitor WebView로 Railway 서버 URL을 로드하는 구조
- Railway 배포가 완료되면 앱을 재시작하여 변경사항 확인

## 네이티브 빌드가 필요한 경우 vs 불필요한 경우

### 네이티브 빌드 불필요 (대부분의 경우)

웹 코드만 변경한 경우, git push만 하면 끝입니다.

- UI 디자인 변경 (레이아웃, 색상, 폰트 등)
- 새로운 페이지/화면 추가
- API 연동 및 서버 로직 변경
- 버그 수정

**이 경우의 흐름:**
```
코드 수정 → git push → Railway 배포 → 앱 재시작으로 확인
```

### 네이티브 빌드 필요

Capacitor 플러그인이나 iOS 프로젝트 설정이 변경된 경우에만 필요합니다.

- 새로운 Capacitor 플러그인 추가/제거
- iOS 권한 설정 변경 (카메라, 알림 등)
- `capacitor.config.ts` 설정 변경
- iOS 네이티브 코드 수정

**이 경우의 흐름:**
```
코드 수정 → npx cap sync ios → Xcode에서 빌드 → TestFlight 업로드 → QA
```
