# 🏜️ Sand Sandbox — Falling Sand Simulation

> 모래, 물, 불, 식물 등 18종 요소 간 화학 반응이 일어나는 인터랙티브 샌드박스 시뮬레이션

## 📋 프로젝트 개요

셀룰러 오토마타 기반의 Falling Sand 시뮬레이션입니다. 마우스로 요소를 화면에 그려 넣으면 중력, 화학 반응, 상태 변화가 실시간으로 일어납니다. "Noita" 게임의 축소판 같은 경험을 브라우저에서 제공합니다.

## 🛠️ 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 렌더링 | HTML5 Canvas (ImageData 픽셀 단위) |
| 테스트 | Vitest (122개 테스트) |
| 스타일 | 인라인 스타일 (다크 테마 + 글라스모피즘) |

> **외부 API 없음, 외부 파일 없음, 비용 0**

## 🧪 구현된 요소 (18종)

### Powder (분말)

| 요소 | 동작 | 색상 |
|------|------|------|
| **Sand** (모래) | 중력으로 떨어짐, 쌓임, 사선으로 미끄러짐 | `#D4A574` |
| **Gunpowder** (화약) | 모래처럼 떨어짐, 불/스파크 → 폭발 (반경 3셀) | `#444444` |

### Liquid (액체)

| 요소 | 동작 | 색상 |
|------|------|------|
| **Water** (물) | 중력 + 좌우 확산, 100°C에서 증발 | `#4A90D9` |
| **Oil** (오일) | 물보다 가벼워 물 위에 뜸, 불 → 번짐 | `#8B6914` |
| **Acid** (산) | 중력으로 흐름, 닿는 모든 것 녹임 (돌/벽 제외) | `#7FFF00` |
| **Lava** (용암) | 느리게 흐름 (50% 확률 스킵), 물 → 돌+증기 | `#FF2200` |

### Gas (가스)

| 요소 | 동작 | 색상 |
|------|------|------|
| **Fire** (불) | 위로 올라감, 수명 제한 (~30프레임), 나무/식물/오일에 번짐 | `#FF4500` |
| **Smoke** (연기) | 위로 올라감, 서서히 사라짐 | `#696969` |
| **Spark** (불꽃) | 빠르게 이동, 짧은 수명, 화약 → 폭발 | `#FFD700` |

### Solid (고체)

| 요소 | 동작 | 색상 |
|------|------|------|
| **Stone** (돌) | 고정, 산에 녹지 않음 | `#808080` |
| **Wall** (벽) | 완전 고정, 모든 요소 차단 | `#555555` |
| **Wood** (나무) | 고정, 불/용암에 타거나 돌로 변함 | `#8B6914` |
| **Plant** (식물) | 고정, 물 옆에서 3% 확률 성장 | `#228B22` |
| **Ice** (얼음) | 고정, 온도 > 0°C → 물 | `#ADD8E6` |
| **Clone** (복제기) | 닿은 요소 기억, 5프레임마다 위로 방출 | `#9370DB` |

### Tool (도구)

| 요소 | 동작 | 색상 |
|------|------|------|
| **Erase** (지우개) | 드래그한 영역의 요소를 삭제 | `#FF4444` |

## 🔬 화학 반응 규칙

```
Water + Fire      → Steam + Smoke
Water + Lava      → Stone + Steam
Fire  + Wood      → Fire (번짐)
Fire  + Plant     → Fire (번짐)
Fire  + Oil       → Fire (번짐)
Fire  + Gunpowder → Explosion (반경 3셀)
Spark + Gunpowder → Explosion
Lava  + Wood      → Stone + Fire
Acid  + (대부분)  → Acid + (대상 삭제, 돌/벽 제외)
Plant + Water     → Plant 성장 (3% 확률)
Ice   + (온도>0°C)→ Water
Water + (온도>100°C)→ Steam
```

## 🖱️ 사용자 인터랙션

### 마우스
- **좌클릭 + 드래그**: 현재 선택된 요소 그리기
- **우클릭 + 드래그**: 요소 삭제 (지우개 모드)
- **스크롤**: 브러시 크기 조절 (1~20)

### 터치 (모바일)
- **터치 + 드래그**: 요소 그리기
- **핀치 줌**: 브러시 크기 조절

### 키보드
- `1~9`, `0`: Powder/Liquid/Solid 빠른 선택
- `q` `w` `e` `r` `t`: Gunpowder, Ice, Smoke, Spark, Clone
- `x`: Erase 선택
- `Space`: 일시정지/재생
- `C`: 화면 전체 클리어
- `[` / `]`: 시뮬레이션 속도 조절 (0.5x ~ 3x)

### 툴바 UI
- 요소 카테고리별 분류 (Powder / Liquid / Gas / Solid / Tool)
- 배경색 선택 (7종 프리셋)
- 브러시 크기 ±버튼
- 클리어 / 일시정지 버튼
- HUD (FPS, 활성 셀 수, 속도, 브러시, 선택 요소)

## 🏗️ 프로젝트 구조

```
src/
├── lib/
│   ├── engine/                    # 순수 TypeScript 엔진 (React 무의존)
│   │   ├── types.ts               # ElementType enum (18종), 카테고리 분류, DENSITY_MAP
│   │   ├── grid.ts                # SoA 그리드 (Uint8Array/Float32Array)
│   │   ├── random.ts              # mulberry32 PRNG
│   │   ├── lifetime.ts            # 수명/소멸 시스템
│   │   ├── temperature.ts         # 온도 전파 + 상변화 (Ice→Water→Steam)
│   │   ├── physics.ts             # 물리 엔진 오케스트레이터
│   │   ├── physics-powder.ts      # 분말 물리 (Sand, Gunpowder)
│   │   ├── physics-liquid.ts      # 액체 물리 (Water, Oil, Acid, Lava)
│   │   ├── physics-gas.ts         # 가스 물리 (Fire, Steam, Smoke, Spark)
│   │   ├── physics-special.ts     # 특수 물리 (Plant 성장, Clone 복제)
│   │   ├── physics-utils.ts       # 물리 공용 유틸 (swap, tryMove 등)
│   │   ├── reactions.ts           # 화학 반응 규칙 + 폭발
│   │   ├── simulator.ts           # 메인 시뮬레이터 (step/pause/resume/setSpeed)
│   │   └── __tests__/             # 122개 테스트 (11개 파일)
│   └── renderer/
│       ├── colors.ts              # COLOR_MAP + ±10 랜덤 색상 변형
│       └── canvas.ts              # ImageData 렌더링 (배경색 선택 지원)
├── components/
│   ├── SandSimApp.tsx             # 상태 관리 (선택 요소, 브러시, 속도, 배경색)
│   ├── SimulationCanvas.tsx       # Canvas + 키보드 통합
│   ├── Toolbar.tsx                # 카테고리별 요소 팔레트 + 컨트롤
│   └── HUD.tsx                    # FPS/셀/속도/요소 오버레이
├── hooks/
│   ├── useCanvasRenderer.ts       # rAF 루프 + 엔진 초기화
│   ├── useCanvasInput.ts          # 마우스/터치 입력 + 선형 보간 그리기
│   └── useKeyboard.ts             # 키보드 단축키
└── app/
    └── page.tsx                   # Next.js 페이지 (SSR 비활성화)
```

## ⚡ 성능

- **그리드**: 200×150 (셀 크기 4px, 캔버스 800×600)
- **렌더링**: ImageData 직접 조작 (DOM 없이 픽셀 단위)
- **엔진**: 순수 함수 + 클로저 (클래스 없음), SoA 데이터 구조
- **스캔**: 하단→상단 (중력 자연스럽게), processed 플래그로 중복 방지

## 🎨 디자인

- **다크 테마** (`#0a0a14`) + 글라스모피즘 (backdrop-filter blur)
- **카테고리별 색상 코드**: Powder(베이지), Liquid(파랑), Gas(주황), Solid(회색), Tool(빨강)
- **반응형**: 모바일 터치 지원, 44px 최소 탭 타겟
- **배경색**: 7종 프리셋 (Navy, Black, Gray, Blue, Green, Purple, White)

## 🚀 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 열기

## 📦 빌드 & 테스트

```bash
npm run build      # 프로덕션 빌드
npx vitest run     # 122개 테스트 실행
```

## 📄 라이선스

MIT
