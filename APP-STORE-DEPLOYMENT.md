# 📱 앱스토어 배포 가이드

BookIt 앱을 iOS App Store와 Google Play Store에 배포하는 방법을 안내합니다.

## 🎯 완료된 작업

✅ PWA(Progressive Web App) 기능 추가
✅ Capacitor를 사용한 네이티브 앱 변환
✅ iOS 및 Android 플랫폼 프로젝트 생성
✅ 앱 아이콘 및 스플래시 스크린 생성
✅ 빌드 스크립트 구성

---

## 📋 사전 준비사항

### 1. Apple Developer 계정 (iOS App Store)
- **비용**: $99/년
- **등록**: https://developer.apple.com
- **필요사항**:
  - Apple ID
  - 결제 수단 (신용카드)
  - 2단계 인증 활성화

### 2. Google Play Developer 계정 (Android)
- **비용**: $25 (일회성)
- **등록**: https://play.google.com/console
- **필요사항**:
  - Google 계정
  - 결제 수단
  - 개발자 정보 등록

### 3. 개발 환경
- **macOS** (iOS 빌드용) - Xcode 필요
- **Android Studio** (Android 빌드용)
- **Node.js** 18 이상
- **Java JDK** 17 (Android용)

---

## 🤖 Android 앱 배포

### 1단계: 앱 서명 키 생성

```bash
# 키스토어 생성
keytool -genkey -v -keystore bookit-release.keystore \
  -alias bookit -keyalg RSA -keysize 2048 -validity 10000

# 생성된 키스토어를 안전한 곳에 보관하세요!
```

### 2단계: Gradle 설정 업데이트

`android/app/build.gradle` 파일 수정:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file("../../bookit-release.keystore")
            storePassword "YOUR_KEYSTORE_PASSWORD"
            keyAlias "bookit"
            keyPassword "YOUR_KEY_PASSWORD"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3단계: Release APK/AAB 빌드

```bash
# AAB (App Bundle) 생성 - Play Store 업로드용
npm run cap:build:android
cd android
./gradlew bundleRelease

# 생성된 파일 위치:
# android/app/build/outputs/bundle/release/app-release.aab
```

### 4단계: Google Play Console에서 앱 등록

1. **Play Console 접속**: https://play.google.com/console
2. **새 앱 만들기** 클릭
3. **앱 정보 입력**:
   - 앱 이름: BookIt - 책 기록
   - 기본 언어: 한국어
   - 앱 유형: 앱
   - 무료/유료: 무료

4. **스토어 등록정보 작성**:
   - 간단한 설명 (80자)
   - 자세한 설명 (4000자)
   - 스크린샷 업로드 (최소 2개)
   - 아이콘 업로드 (512x512 PNG)

5. **AAB 파일 업로드**:
   - 프로덕션 > 새 버전 만들기
   - AAB 파일 업로드
   - 버전 노트 작성

6. **콘텐츠 등급 설정**:
   - 설문지 작성
   - 등급 자동 생성

7. **대상 고객 및 콘텐츠 설정**:
   - 타겟 연령층 선택
   - 개인정보 처리방침 URL (필수)

8. **검토 후 게시**:
   - 모든 항목 완료 확인
   - 검토 제출 (심사 1-3일 소요)

---

## 🍎 iOS 앱 배포

### 1단계: Xcode에서 프로젝트 열기

```bash
npm run cap:open:ios
```

### 2단계: App Store Connect에서 앱 등록

1. **App Store Connect 접속**: https://appstoreconnect.apple.com
2. **나의 앱** > **새로운 앱** 클릭
3. **앱 정보 입력**:
   - 플랫폼: iOS
   - 이름: BookIt - 책 기록
   - 기본 언어: 한국어
   - 번들 ID: com.bookit.app (Xcode에서 설정한 것과 동일)
   - SKU: bookit-001
   - 사용자 액세스: 전체 액세스

### 3단계: Xcode에서 서명 설정

1. Xcode에서 프로젝트 선택
2. **Signing & Capabilities** 탭
3. **Team** 선택 (Apple Developer 계정)
4. **Automatically manage signing** 체크
5. **Bundle Identifier** 확인: com.bookit.app

### 4단계: 앱 아카이브 및 업로드

1. Xcode 메뉴: **Product** > **Archive**
2. 아카이브 완료 후 **Distribute App** 클릭
3. **App Store Connect** 선택
4. **Upload** 선택
5. 서명 옵션 선택
6. **Upload** 클릭

### 5단계: App Store Connect에서 앱 제출

1. **App Store Connect**에서 앱 선택
2. **앱 스토어** 탭에서 **버전 정보** 작성:
   - 이름: BookIt - 책 기록
   - 부제목: 나의 독서 기록 관리
   - 설명: 책을 검색하고, 독서 상태를 관리하고...
   - 키워드: 독서, 책, 기록, 완독
   - 스크린샷 업로드 (iPhone, iPad 각각)
   - 아이콘 확인

3. **가격 및 사용 가능 여부**:
   - 가격: 무료
   - 판매 국가: 한국 등

4. **앱 개인정보 보호**:
   - 개인정보 처리방침 URL
   - 데이터 수집 정보 입력

5. **검토를 위해 제출**:
   - 모든 정보 입력 완료 확인
   - **제출** 클릭 (심사 1-2주 소요)

---

## 🛠️ 유용한 스크립트

```bash
# 웹 빌드 및 네이티브 동기화
npm run cap:sync

# Android Studio 열기
npm run cap:open:android

# Xcode 열기
npm run cap:open:ios

# 아이콘 재생성
npm run generate:icons

# Android Release 빌드
npm run cap:build:android

# iOS 빌드 (Xcode에서 Archive 필요)
npm run cap:build:ios
```

---

## 📸 스크린샷 가이드

### Android (Google Play)
- **최소 2개, 최대 8개**
- 해상도: 320px ~ 3840px (최소 한 변)
- 형식: PNG 또는 JPG
- 추천 사이즈: 1080 x 1920 (세로), 1920 x 1080 (가로)

### iOS (App Store)
**iPhone 6.7" (필수)**:
- 1290 x 2796 (세로)
- 2796 x 1290 (가로)

**iPhone 6.5" (필수)**:
- 1242 x 2688 (세로)
- 2688 x 1242 (가로)

**iPad Pro 12.9" (선택)**:
- 2048 x 2732 (세로)
- 2732 x 2048 (가로)

---

## ⚠️ 중요 체크리스트

### 배포 전 확인사항

- [ ] 앱 아이콘이 올바르게 표시되는가?
- [ ] 스플래시 스크린이 정상적으로 작동하는가?
- [ ] 앱 이름과 버전이 올바른가?
- [ ] 개인정보 처리방침 페이지가 준비되었는가?
- [ ] 앱의 모든 기능이 정상 작동하는가?
- [ ] API 엔드포인트가 프로덕션 서버를 가리키는가?
- [ ] 충돌 리포팅이 설정되었는가? (선택)
- [ ] 분석 도구가 설정되었는가? (선택)

### 법적 요구사항

- [ ] 개인정보 처리방침 작성
- [ ] 이용약관 작성 (필요시)
- [ ] 저작권 및 라이선스 확인
- [ ] 제3자 라이브러리 라이선스 고지

---

## 🔄 업데이트 배포

### 버전 업데이트 절차

1. **버전 번호 증가**:
   ```bash
   # package.json
   "version": "1.0.1"

   # Android: android/app/build.gradle
   versionCode 2
   versionName "1.0.1"

   # iOS: Xcode에서 버전 업데이트
   ```

2. **빌드 및 배포**:
   - Android: AAB 재생성 후 Play Console 업로드
   - iOS: 아카이브 후 App Store Connect 업로드

3. **릴리스 노트 작성**:
   - 새로운 기능
   - 버그 수정
   - 개선사항

---

## 💡 팁과 권장사항

### 성공적인 앱 출시를 위한 팁

1. **앱 설명 작성**:
   - 명확하고 간결하게
   - 주요 기능 강조
   - 키워드 자연스럽게 포함

2. **스크린샷 최적화**:
   - 주요 기능을 보여주는 화면 선택
   - 텍스트 오버레이로 기능 설명 추가
   - 밝고 선명한 이미지 사용

3. **앱 미리보기 영상** (선택):
   - 15-30초 길이
   - 주요 기능 시연
   - iOS App Store에서 큰 효과

4. **사용자 피드백**:
   - 베타 테스트 진행 (TestFlight, Google Play 내부 테스트)
   - 리뷰에 적극 응답
   - 피드백 반영하여 업데이트

5. **ASO (앱 스토어 최적화)**:
   - 적절한 키워드 선택
   - 매력적인 아이콘 디자인
   - 정기적인 업데이트

---

## 🆘 문제 해결

### 일반적인 문제

**Q: Android 빌드 실패 - "SDK not found"**
A: Android Studio에서 SDK 설치 확인, ANDROID_HOME 환경변수 설정

**Q: iOS 빌드 실패 - "Signing error"**
A: Xcode에서 Team 선택 및 서명 인증서 확인

**Q: 앱 심사 거부 - "Metadata rejected"**
A: 스크린샷, 설명, 개인정보 처리방침 등 메타데이터 재확인

**Q: Play Store 업로드 실패 - "APK/AAB 서명 오류"**
A: 서명 키 확인, build.gradle 설정 재확인

---

## 📚 추가 리소스

- **Capacitor 공식 문서**: https://capacitorjs.com/docs
- **Google Play Console 도움말**: https://support.google.com/googleplay/android-developer
- **App Store Connect 도움말**: https://developer.apple.com/app-store-connect/
- **ASO 가이드**: https://developer.apple.com/app-store/product-page/

---

## 📞 지원

문제가 발생하거나 도움이 필요한 경우:
1. Capacitor GitHub Issues: https://github.com/ionic-team/capacitor/issues
2. Stack Overflow (태그: capacitor, ionic)
3. 개발자 커뮤니티 포럼

---

**축하합니다! 🎉**

이제 BookIt 앱을 앱스토어에 배포할 준비가 완료되었습니다!
