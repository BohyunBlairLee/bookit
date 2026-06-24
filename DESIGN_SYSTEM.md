# BookIt Design System

Figma 디자인 기반 통합 디자인 시스템 (2024)

## 1. Colors (색상)

### Primary
| 이름 | 값 | 용도 |
|------|-----|------|
| Primary | `#8c53f6` | CTA 버튼, 활성 탭, 강조 요소 |
| Primary Light | `#8c53f6/10%` | 배경 틴트 |

### Text
| 이름 | 값 | CSS 변수 | 용도 |
|------|-----|----------|------|
| Heading | `#4a4a4a` | `--text-heading` | 페이지 제목, 섹션 제목 |
| Body | `#4f4d4d` | `--text-body` | 본문 텍스트 |
| Secondary | `#6b6b6b` | `--text-secondary` | 저자, 출판사, 보조 정보 |
| Placeholder | `#c6c6c6` | `--text-placeholder` | 입력 필드 플레이스홀더 |
| Muted | `#a0a0a1` | `--text-muted` | 비활성, 안내 텍스트 |

### Surface
| 이름 | 값 | 용도 |
|------|-----|------|
| Background | `#ffffff` | 기본 배경 |
| Surface | `#f4f4f4` | 입력 필드, 노트 카드 배경 |
| Track | `#e9e9e9` | 탭 트랙, 비활성 영역 |

### Status
| 이름 | 값 | 용도 |
|------|-----|------|
| Star | `#EAB308` | 별점 |
| Destructive | `#ef4444` | 삭제 |

---

## 2. Typography (타이포그래피)

### Font Family
```
Pretendard (Variable)
Fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
```

### Font Scale
| 용도 | 크기 | 두께 | 행간 |
|------|------|------|------|
| 페이지 제목 | 20px | Bold (700) | normal |
| 섹션 제목 | 18px | Bold (700) | 29px |
| 본문 | 16px | Medium (500) | 29px |
| 카드 제목 | 13px | Bold (700) | 29px |
| 카드 부제 | 10px | Regular (400) | 29px |
| 버튼 텍스트 | 15px | Medium (500) | 20px |
| 탭 텍스트 | 14px | Medium (500) | 20px |
| 작은 텍스트 | 12px | Medium (500) | 29px |

### Letter Spacing
- 버튼/탭: `-0.24px`
- 페이지 제목: `0`

---

## 3. Spacing (간격)

| 토큰 | 값 | 용도 |
|------|-----|------|
| page-x | `16px` | 페이지 좌우 패딩 |
| grid-x | `39px` | 책 그리드 좌우 패딩 |
| grid-gap | `25px` | 책 그리드 아이템 간격 |
| section-y | `14px` | 섹션 상하 패딩 |
| component-gap | `5px` | 카드 내부 요소 간격 |

---

## 4. Components (컴포넌트)

### Top Bar
- 높이: `52px`
- 패딩: 세로 `12px`
- 제목: Inter Bold 20px, `#4a4a4a`
- 아이콘: `24px`
- 좌우 콘텐츠 너비: `343px` (센터 정렬)

### Bottom Navigation
- 배경: white
- 아이콘: `24px`
- 비활성: outline 스타일
- 활성: filled 스타일 + primary 색상
- 탭 간격: `82px`
- safe area: `env(safe-area-inset-bottom)`

### Filter Tabs (필터 탭)
- 트랙: `#e9e9e9`, border-radius `25px`
- 활성 탭: `#8c53f6` 배경, white 텍스트, `25px` 둥근 모서리
- 비활성 탭: 투명 배경, `#4a4a4a` 텍스트
- 탭 너비: `80px`
- 탭 높이: `45px`
- 텍스트: Pretendard Medium 14px

### Search Input
- 배경: `#f4f4f4`
- 둥근 모서리: `10px`
- 높이: `48px`
- 패딩: `8px 16px`
- 검색 아이콘: `22.5px`, 왼쪽
- 닫기 아이콘: `24px`, 오른쪽
- 플레이스홀더: Pretendard Medium 14px, `#c6c6c6`

### Book Card (책 카드 - 그리드)
- 썸네일: `82px` x `121px`, border-radius `8px`
- 제목: Pretendard Bold 13px, black, 한 줄 말줄임
- 저자: Pretendard Regular 10px, `#6b6b6b`, 한 줄 말줄임
- 간격: 썸네일과 텍스트 사이 `5px`

### Book Detail (책 상세)
- 책 정보: 가로 레이아웃 (썸네일 82x121 + 텍스트)
- 제목: Pretendard Bold 16px
- 저자: Pretendard Regular 14px, `#6b6b6b`
- 출판사/날짜: Pretendard Regular 14px, `#6b6b6b` (구분선: 세로 11px)
- 상태 드롭다운: `#8c53f6` pill, 12px 텍스트, 화살표 아이콘

### CTA Button (주요 버튼)
- 배경: `#8c53f6`
- 텍스트: white, 15px Medium
- 둥근 모서리: `24px`
- 높이: `48px`
- 패딩: `12px 45px`

### Reading Note Card
- 배경: `#f4f4f4`
- 둥근 모서리: `20px`
- 빈 상태 텍스트: Pretendard Regular 13px, `#a0a0a1`, 가운데 정렬

### Status Dropdown
- 배경: `#8c53f6`
- 텍스트: white, Pretendard Medium 12px
- 둥근 모서리: `12px`
- 화살표: 180도 회전 (아래 방향)

---

## 5. Icons (아이콘)

| 이름 | 출처 | 크기 | 용도 |
|------|------|------|------|
| tabler:home | Tabler Icons | 24px | 홈 탭 |
| icon-park-solid:book-one | IconPark | 24px | 책장 탭 |
| lsicon:setting-outline | LSIcon | 24px | 설정 탭 |
| ic:round-plus | Material Icons | 24px | 추가 버튼 |
| ep:arrow-up-bold | Element Plus | 24px | 뒤로가기 (좌측 회전) |
| tabler:search | Tabler Icons | 22.5px | 검색 |
| tabler:scan | Tabler Icons | 24px | 바코드 스캔 |
| gg:close-o | css.gg | 24px | 닫기/초기화 |

---

## 6. Layout (레이아웃)

### 화면 구조
```
┌─────────────────────────────┐
│   Status Bar (30px)         │
├─────────────────────────────┤
│   Top Bar (52px)            │
│   제목 + 액션 아이콘         │
├─────────────────────────────┤
│                             │
│   Content Area              │
│   (스크롤 가능)              │
│                             │
├─────────────────────────────┤
│   Bottom Nav (~52px)        │
│   홈 | 책장 | 설정           │
├─────────────────────────────┤
│   Safe Area (34px)          │
└─────────────────────────────┘
```

### 기기 기준
- 디자인 기준: iPhone (375px)
- 최대 너비: 480px (태블릿/데스크탑)
