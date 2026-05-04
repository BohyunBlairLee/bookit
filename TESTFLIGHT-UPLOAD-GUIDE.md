# TestFlight 업로드 가이드

## ✅ 빌드 준비 완료

웹 앱 빌드와 iOS 동기화가 완료되었습니다.

### 완료된 작업
- ✅ 웹 앱 빌드 (Vite)
- ✅ Capacitor iOS 동기화
- ✅ iOS 프로젝트 업데이트

### 변경사항
1. **책 검색 기능**
   - Kakao Books API 통합 완료
   - Google Books API 자동 fallback
   - 10초 timeout 설정 (UI 멈춤 방지)
   - API 키 환경변수 검증

2. **UI 개선**
   - 상단 spacing 수정 (status bar에서 32px 추가)
   - iOS Safe Area 적용 (노치/홈 인디케이터 대응)
   - 모든 탭 (홈, 내 서재, 설정) 동시 수정

---

## TestFlight 업로드 방법

### 1단계: Xcode에서 프로젝트 열기

```bash
# 터미널에서 실행
open ios/App/App.xcodeproj
```

또는:
```bash
# Capacitor CLI 사용
npx cap open ios
```

### 2단계: Xcode 설정 확인

1. **타겟 선택**
   - 상단 바에서 `App` 타겟 선택
   - 디바이스를 `Any iOS Device (arm64)` 로 설정

2. **Signing & Capabilities**
   - 프로젝트 네비게이터에서 `App` 클릭
   - `Signing & Capabilities` 탭 선택
   - **Team** 선택 (Apple Developer 계정)
   - **Bundle Identifier** 확인 (예: com.yourcompany.bookit)

3. **버전 확인/업데이트**
   - `General` 탭 선택
   - **Version**: 1.0.0 (또는 원하는 버전)
   - **Build**: 증가 (예: 1 → 2, TestFlight 업로드마다 증가 필요)

### 3단계: Archive 생성

1. Xcode 메뉴에서:
   ```
   Product → Archive
   ```

2. 빌드 완료 대기 (2-5분 소요)

3. **Organizer** 창이 자동으로 열림

### 4단계: TestFlight 업로드

1. **Organizer** 창에서:
   - 방금 생성한 Archive 선택
   - `Distribute App` 버튼 클릭

2. **배포 방법 선택**:
   - `App Store Connect` 선택
   - `Next` 클릭

3. **배포 옵션**:
   - `Upload` 선택
   - `Next` 클릭

4. **App Store Connect 옵션**:
   - 기본 설정 유지
   - ✅ Upload your app's symbols
   - ✅ Manage version and build number
   - `Next` 클릭

5. **자동 서명**:
   - `Automatically manage signing` 선택
   - `Next` 클릭

6. **업로드**:
   - 최종 확인 화면에서 `Upload` 클릭
   - 업로드 완료 대기 (5-10분 소요)

### 5단계: App Store Connect에서 테스터 추가

1. **App Store Connect 접속**
   - https://appstoreconnect.apple.com 접속
   - 로그인

2. **앱 선택**
   - `My Apps` 클릭
   - 해당 앱 선택

3. **TestFlight 탭**
   - 좌측 메뉴에서 `TestFlight` 클릭
   - 업로드한 빌드가 "Processing" 상태로 표시됨
   - **처리 완료 대기** (10-30분 소요, Apple 심사)

4. **내부 테스터 추가**
   - `Internal Testing` 섹션에서 테스터 그룹 선택
   - `Testers` 추가
   - 이메일 주소 입력

5. **빌드 배포**
   - 빌드 처리 완료 후
   - 빌드 옆 `+` 버튼 클릭
   - 테스터 그룹에 빌드 할당

---

## QA 테스트 항목

### 1. 책 검색 기능
- [ ] 홈 탭에서 검색창 표시 확인
- [ ] 한글 검색 (예: "해리포터") 작동 확인
- [ ] 영어 검색 (예: "Harry Potter") 작동 확인
- [ ] 검색 결과 표시 확인 (책 표지, 제목, 저자)
- [ ] 검색 결과 없을 때 메시지 표시 확인
- [ ] 10초 이상 걸리면 timeout 확인
- [ ] 네트워크 끊고 테스트 (fallback 동작 확인)

### 2. 변경된 UI
- [ ] **홈 탭**: 상단 "홈" 제목과 status bar 사이 간격 확인
- [ ] **내 서재 탭**: 상단 "나의 책장" 제목과 status bar 사이 간격 확인
- [ ] **설정 탭**: 상단 "설정" 제목과 status bar 사이 간격 확인
- [ ] 노치 있는 기기 (iPhone X 이상): Safe Area 정상 적용 확인
- [ ] 노치 없는 기기 (iPhone 8, SE): 간격 정상 확인
- [ ] 하단 탭 바: 홈 인디케이터와 겹치지 않는지 확인
- [ ] 가로 모드: UI 정상 표시 확인

### 3. 기존 기능 회귀 테스트
- [ ] 책 추가 기능
- [ ] 책 상태 변경 (읽을 예정/읽는 중/완독)
- [ ] 독서 노트 추가
- [ ] 책 삭제

---

## 트러블슈팅

### Archive 실패
```
Error: Signing certificate is invalid
```
**해결책**: Xcode → Preferences → Accounts → Download Manual Profiles

### 업로드 실패
```
Error: Build version already exists
```
**해결책**: Build 번호를 증가시키고 다시 Archive

### Processing 오래 걸림
- Apple 서버 상태: https://developer.apple.com/system-status/
- 일반적으로 10-30분 소요, 최대 24시간까지 가능

### TestFlight 앱에서 보이지 않음
- 이메일 확인 (초대 링크)
- App Store Connect에서 테스터 추가 확인
- 빌드가 테스터 그룹에 할당되었는지 확인

---

## 현재 빌드 정보

- **프로젝트 위치**: `ios/App/App.xcodeproj`
- **웹 빌드 위치**: `dist/public/`
- **iOS 웹 자산**: `ios/App/App/public/`

## 참고사항

- TestFlight 빌드는 90일 동안 유효
- 내부 테스터는 최대 100명
- 외부 테스터는 Apple 심사 필요 (1-2일 소요)

---

## 요약

```bash
# 1. 빌드 (이미 완료됨)
npm run build
npx cap sync ios

# 2. Xcode 열기
npx cap open ios

# 3. Xcode에서:
# - Product → Archive
# - Distribute App → App Store Connect → Upload

# 4. App Store Connect에서:
# - TestFlight 탭
# - 빌드 처리 대기
# - 테스터 추가
# - 빌드 배포
```

QA 진행하시고 이슈 있으면 알려주세요! 🚀
