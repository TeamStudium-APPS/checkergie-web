# Checkergie Design System

Checkergie의 공용 UI는 `packages/ui`에서 관리한다. 이 문서는 토큰을 추가하거나 컴포넌트를 만들 때 팀이 같은 기준으로 판단하기 위한 작업 규칙이다. Git 브랜치와 PR 규칙은 기존 Git 문서를 따른다.

## 기본 원칙

- Checkergie 제품 UI를 위한 라이브러리다. 랜딩 페이지용 섹션이나 화면 전체 레이아웃은 넣지 않는다.
- Figma는 시각 기준, Storybook은 구현 상태를 확인하는 카탈로그, `packages/ui`는 실제 동작의 기준이다.
- `bigtablet-design-system`은 이미 검증된 로직과 인터랙션을 참고할 수 있지만, 스타일과 API는 Checkergie에 맞춘다.
- 같은 의미의 값이 두 번 등장하기 시작하면 토큰 후보로 본다. 이미 토큰이 있다면 임의의 색상이나 수치를 새로 쓰지 않는다.
- 단순한 prop 조합보다 합성 가능한 API를 우선한다. 아이콘이나 버튼이 들어갈 자리는 특정 아이콘 이름 대신 React 노드를 받는다.
- 공용 아이콘은 `lucide-react`를 사용하고, 직접 작성한 SVG를 컴포넌트 안에 중복해서 넣지 않는다.
- 컴포넌트와 내부 함수는 가능한 한 `const`로 선언한다. 컴포넌트 모듈은 기본 내보내기를 사용하고 배럴 파일에서 이름 있는 API로 다시 노출한다.

## 구조

```text
packages/ui/src/
├── foundations/   # 색상, 타이포그래피, 간격, 모션 등 토큰 설명
├── atoms/         # Button, Chip, TextField처럼 더 쪼개기 어려운 요소
├── molecules/     # FormField, FormActions처럼 atom을 묶는 패턴
├── organisms/     # Form, Modal처럼 상태와 여러 요소를 조합하는 단위
├── shared/        # 공개 컴포넌트를 지원하는 훅과 유틸리티
└── styles/        # Pretendard와 Tailwind 테마
```

새 컴포넌트는 가장 낮은 적절한 단계에 둔다. 상위 단계가 하위 단계의 스타일이나 접근성 로직을 복사하지 않도록 조합한다.

## Foundation과 토큰

토큰의 원본은 `packages/ui/src/styles/theme.css`다. Tailwind 클래스에서는 `cg` 접두사를 사용한다.

| 영역 | 사용 기준 | 예시 |
| --- | --- | --- |
| Typography | Pretendard와 용도 기반 크기·굵기 조합 | `font-cg-sans`, `text-cg-body-sm`, `text-cg-heading-sm` |
| Color | 색 이름이 아니라 UI 역할로 선택 | `bg-cg-surface`, `text-cg-muted`, `border-cg-border`, `text-cg-danger` |
| Spacing | 4px 기준 눈금 사용 | `gap-cg-2`, `p-cg-4` |
| Radius | 컴포넌트 성격에 맞는 단계 사용 | `rounded-cg-md`, `rounded-cg-full` |
| Elevation | 일반 카드, 부유 요소, 모달을 구분 | `shadow-cg-card`, `shadow-cg-float`, `shadow-cg-modal` |
| State | hover/pressed/disabled 의미를 유지 | `cg-state-hover`, `cg-state-pressed`, `opacity-cg-disabled` |
| Motion | 빠른 피드백과 화면 전환을 구분 | `duration-cg-fast`, `duration-cg-base`, `ease-cg-standard` |
| Layer | overlay 종류에 따라 단계 사용 | `z-cg-dropdown`, `z-cg-overlay`, `z-cg-toast` |

Foundation Story는 토큰을 눈으로 비교하고 이름을 찾기 위한 화면이다. 큰 히어로 문구나 장식용 레이아웃을 넣지 않고, 실제 색상·크기·그림자·모션 차이가 바로 보이게 만든다. Z-Index처럼 순서 자체가 중요한 토큰은 표와 조작 가능한 3D 스택을 함께 제공한다.

## 컴포넌트 기준

### Button

- `primary`, `secondary`, `outline`, `ghost`와 `sm`, `md`, `lg`를 제공한다.
- `leadingIcon`, `trailingIcon`, `loading`, `disabled`, `fullWidth`를 조합할 수 있다.
- 기본 커서는 pointer, loading은 wait, disabled는 not-allowed다.
- 눌림은 `cg-button-press`의 짧은 scale 모션을 사용하며 reduced motion에서는 제거한다.
- `as` 또는 `href`로 다른 요소를 렌더링해도 unavailable 상태에서 클릭과 포커스를 막는다.

### Chip

- 선택형 `choice`, 정보 표시용 `static`, 제거형 `removable`을 구분한다.
- 선택 표시는 체크 아이콘의 너비·투명도·위치를 함께 바꿔 레이아웃 점프를 줄인다.
- 선택형은 `aria-pressed`, 제거 버튼은 목적이 드러나는 접근성 이름을 사용한다.

### TextField와 Form

- TextField 자체는 입력과 좌우 슬롯, IME 입력 처리를 담당한다.
- 라벨, 도움말, 오류 메시지, required 연결은 `Form.Field`가 담당한다. 라벨은 생략하거나 시각적으로만 숨길 수 있다.
- `leadingIcon`과 `trailingIcon`은 장식용이고, `leadingAction`과 `trailingAction`은 조작용이다.
- `clearable`은 trailing 영역보다 우선하며, 오류가 있으면 도움말 대신 오류 메시지를 노출한다.
- 폼 전체 오류는 `Form`의 `errors`로 전달하고 필드별 오류는 `Form.Field`의 `error`로 덮어쓸 수 있다.

### Modal

- 열림과 닫힘을 부모가 제어하고, 닫힘 모션이 끝날 때까지 DOM을 유지한다.
- ESC, 바깥 영역 클릭, 닫기 버튼, focus trap, body scroll lock을 함께 검증한다.
- `dismissible=false`일 때 사용자가 닫을 수 있는 경로를 모두 비활성화한다.
- 제목이 없으면 `ariaLabel`을 제공한다. 닫힘 완료 뒤 작업이 필요하면 `onExited`를 사용한다.

## Storybook 작성 규칙

- story 제목은 `Foundation/*`, `Atoms/*`, `Molecules/*`, `Organisms/*` 구조를 유지한다.
- `Default`만 두지 말고 실제로 판단해야 하는 상태를 한 화면 또는 별도 story로 보여준다.
- 최소 상태는 기본, hover/focus 확인 가능 상태, disabled, loading 또는 error처럼 컴포넌트에 해당하는 예외 상태다.
- 인터랙션이 핵심이면 story 내부에 상태를 두어 직접 클릭해 볼 수 있게 한다.
- 문구는 짧고 제품 문맥에 가깝게 쓴다. 불필요하게 설명적인 마케팅 문구는 피한다.

## 접근성과 모션

- 마우스로 클릭할 수 있는 요소는 키보드로도 사용할 수 있어야 한다.
- 아이콘 전용 버튼에는 `aria-label`이 필요하다. 장식 아이콘은 접근성 트리에서 숨긴다.
- focus-visible 상태는 배경과 구분되어야 한다.
- disabled와 loading은 이벤트, tab 순서, aria 상태, 커서 표현이 서로 일치해야 한다.
- 동작 피드백은 짧게 유지하고 위치가 크게 튀는 모션을 피한다. `prefers-reduced-motion`에서는 의미 없는 변형을 제거한다.

## 작업 순서와 검증

1. 기존 토큰과 하위 컴포넌트로 해결할 수 있는지 먼저 확인한다.
2. 컴포넌트와 story를 함께 작성한다.
3. Storybook에서 기본·예외·인터랙션 상태를 직접 확인한다.
4. 아래 명령으로 정적 검증과 Storybook 빌드를 마친다.

```bash
pnpm check:ui
```

테스트 러너는 아직 도입하지 않는다. 도입 시에는 `packages/ui/templates/component.test.tsx.template`을 출발점으로 삼고, 사용자에게 보이는 동작과 접근성 계약을 우선 검증한다.
