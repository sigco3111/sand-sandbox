<div align="center">

# 🏜️ Sand Sandbox

**Falling Sand Simulation — 브라우저에서 즐기는 파티클 샌드박스**

모래, 물, 불, 용암, 화약 등 **18종 요소**가 중력과 화학 반응으로 실시간 상호작용하는 인터랙티브 시뮬레이션

[**▶ 라이브 데모 바로가기**](https://sand-sandbox-sigco3111s-projects.vercel.app) · [GitHub](https://github.com/sigco3111/sand-sandbox)

</div>

---

## ✨ 특징

- 🧪 **18종 파티클** — Powder, Liquid, Gas, Solid, Tool 카테고리로 분류
- ⚗️ **화학 반응 시스템** — 물+불=증기, 용암+물=돌, 화약+불=폭발 등
- 🌡️ **온도 전파** — Ice → Water → Steam 상변화, 열 확산
- 🔥 **폭발 시뮬레이션** — 화약이 불/불꽃에 닿으면 반경 3셀 폭발
- 🎨 **7종 배경색 프리셋** + 다크 글라스모피즘 UI
- 📱 **모바일 터치 지원** — 핀치 줌으로 브러시 크기 조절
- ⚡ **Zero-dependency 엔진** — 순수 TypeScript, 외부 API 없음
- 🧪 **122개 단위 테스트** — Vitest 기반 안정적인 엔진

## 🎮 플레이 방법

### 마우스
| 조작 | 동작 |
|------|------|
| 좌클릭 + 드래그 | 요소 그리기 |
| 우클릭 + 드래그 | 지우개 모드 |
| 스크롤 | 브러시 크기 조절 (1~15) |

### 키보드 단축키
| 키 | 요소 | 키 | 요소 |
|----|------|----|------|
| `1` | Sand | `6` | Oil |
| `2` | Water | `7` | Lava |
| `3` | Stone | `8` | Wood |
| `4` | Wall | `9` | Plant |
| `5` | Fire | `0` | Acid |
| `q` | Gunpowder | `w` | Ice |
| `e` | Smoke | `r` | Spark |
| `t` | Clone | `x` | Erase |

| 키 | 동작 |
|----|------|
| `Space` | 일시정지 / 재생 |
| `C` | 화면 전체 클리어 |
| `[` / `]` | 시뮬레이션 속도 (0.5x ~ 3x) |

## 🧪 파티클 요소

### Powder (분말)
| 요소 | 동작 |
|------|------|
| 🟫 **Sand** | 중력으로 떨어지고 쌓임, 사면 미끄러짐 |
| ⬛ **Gunpowder** | 모래처럼 낙하, 불/스파크 닿으면 **폭발** (반경 3셀) |

### Liquid (액체)
| 요소 | 동작 |
|------|------|
| 🔵 **Water** | 중력 + 좌우 확산, 100°C에서 증발 |
| 🟤 **Oil** | 물보다 가벼워 물 위에 뜸, 불에 타서 번짐 |
| 🟢 **Acid** | 닿는 대부분의 것을 녹임 (돌/벽 제외) |
| 🔴 **Lava** | 느리게 흐름, 물과 만나면 돌+증기 |

### Gas (가스)
| 요소 | 동작 |
|------|------|
| 🟧 **Fire** | 위로 올라감, 수명 ~30프레임, 나무/식물/오일에 번짐 |
| ⬜ **Smoke** | 위로 올라가며 서서히 사라짐 |
| 🟡 **Spark** | 빠르게 이동, 짧은 수명, 화약을 터뜨림 |
| 💨 **Steam** | 물+불/물+용암 반응으로 생성, 위로 올라감 |

### Solid (고체)
| 요소 | 동작 |
|------|------|
| 🪨 **Stone** | 고정, 산에 녹지 않음 |
| 🧱 **Wall** | 완전 고정, 모든 요소 차단 |
| 🪵 **Wood** | 고정, 불/용암에 타거나 돌로 변함 |
| 🌿 **Plant** | 고정, 물 옆에서 3% 확률로 성장 |
| 🧊 **Ice** | 고정, 온도 > 0°C에서 물로 녹음 |
| 🟣 **Clone** | 닿은 요소 기억, 5프레임마다 위로 방출 |

### Tool (도구)
| 요소 | 동작 |
|------|------|
| 🔴 **Erase** | 드래그한 영역의 요소를 삭제 |

## ⚗️ 화학 반응

```
Water + Fire        → Steam + Smoke
Water + Lava        → Stone + Steam
Fire  + Wood/Plant/Oil → Fire (번짐)
Fire/Spark + Gunpowder → Explosion (반경 3셀)
Lava  + Wood        → Stone + Fire
Acid  + (대부분)    → 전부 삭제 (돌/벽 제외)
Plant + Water       → Plant 성장 (3% 확률)
Ice   + (온도>0°C)  → Water
Water + (온도>100°C)→ Steam
```

## 🛠️ 기술 스택

| 항목 | 기술 |
|------|------|
| **프레임워크** | Next.js 16 (App Router) |
| **언어** | TypeScript 5 |
| **렌더링** | HTML5 Canvas (ImageData 픽셀 단위) |
| **UI** | React 19 + 인라인 스타일 (다크 테마 + 글라스모피즘) |
| **스타일** | Tailwind CSS 4 (글로벌 리셋) |
| **테스트** | Vitest 4 + jsdom (122개 테스트, 11개 파일) |
| **폰트** | Geist Sans / Geist Mono |

> **외부 API 없음 · 외부 라이브러리 없음 · 런타임 비용 0**

## 🏗️ 아키텍처

```
src/
├── lib/
│   ├── engine/                    # 순수 TypeScript 엔진 (React 무의존)
│   │   ├── types.ts               # ElementType enum (18종), 카테고리, DENSITY_MAP
│   │   ├── grid.ts                # SoA 그리드 (Uint8Array/Float32Array)
│   │   ├── random.ts              # mulberry32 PRNG
│   │   ├── lifetime.ts            # 수명/소멸 시스템
│   │   ├── temperature.ts         # 온도 전파 + 상변화
│   │   ├── physics.ts             # 물리 엔진 오케스트레이터
│   │   ├── physics-powder.ts      # 분말 물리 (Sand, Gunpowder)
│   │   ├── physics-liquid.ts      # 액체 물리 (Water, Oil, Acid, Lava)
│   │   ├── physics-gas.ts         # 가스 물리 (Fire, Steam, Smoke, Spark)
│   │   ├── physics-special.ts     # 특수 물리 (Plant 성장, Clone 복제)
│   │   ├── physics-utils.ts       # 물리 공용 유틸 (swap, tryMove 등)
│   │   ├── reactions.ts           # 화학 반응 규칙 + 폭발
│   │   ├── simulator.ts           # 메인 시뮬레이터 (step/pause/resume)
│   │   └── __tests__/             # 122개 테스트
│   └── renderer/
│       ├── colors.ts              # COLOR_MAP + 랜덤 색상 변형 (±10)
│       └── canvas.ts              # ImageData 렌더링 (배경색 선택 지원)
├── components/
│   ├── SandSimApp.tsx             # 상태 관리 (요소, 브러시, 속도, 배경색)
│   ├── SimulationCanvas.tsx       # Canvas + 키보드 통합
│   ├── Toolbar.tsx                # 카테고리별 요소 팔레트 + 컨트롤
│   └── HUD.tsx                    # FPS/셀/속도/요소 오버레이
├── hooks/
│   ├── useCanvasRenderer.ts       # rAF 루프 + 엔진 초기화
│   ├── useCanvasInput.ts          # 마우스/터치 입력 + 선형 보간 그리기
│   └── useKeyboard.ts             # 키보드 단축키
└── app/
    ├── layout.tsx                 # Next.js 레이아웃 (Geist 폰트)
    └── page.tsx                   # SSR 비활성화 + 동적 임포트
```

### 설계 원칙

- **엔진 = 순수 TypeScript** — React 의존성 없이 테스트 가능
- **SoA (Structure of Arrays)** — 타입 배열로 캐시 친화적 메모리 레이아웃
- **클래스 없음** — 클로저 기반 팩토리 함수로 상태 캡슐화
- **processed 플래그** — 하단→상단 스캔으로 중력 자연스럽게, 중복 처리 방지
- **밀도 기반 치환** — 무거운 액체가 가벼운 액체를 밀어냄 (Lava > Acid > Water > Oil)

## ⚡ 성능

| 항목 | 수치 |
|------|------|
| 그리드 | 200×150 셀 (셀 크기 4px) |
| 캔버스 | 800×600 픽셀 |
| 렌더링 | ImageData 직접 조작 (DOM 없음) |
| 스캔 방향 | 하단→상단 (중력 자연스럽게) |
| 속도 조절 | 0.5x ~ 3x |

## 🚀 로컬 실행

```bash
git clone https://github.com/sigco3111/sand-sandbox.git
cd sand-sandbox
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

## 📦 빌드 & 테스트

```bash
npm run build          # 프로덕션 빌드
npm test               # 122개 테스트 실행
npm run test:watch     # 워치 모드
```

## 🌐 배포

[Vercel](https://vercel.com)에 배포됨 — [sand-sandbox-sigco3111s-projects.vercel.app](https://sand-sandbox-sigco3111s-projects.vercel.app)

## 📄 라이선스

MIT
