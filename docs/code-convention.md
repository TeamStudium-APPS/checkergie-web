# 코드 작성 규칙

이 문서는 Checkergie Web의 TypeScript, React, Next.js 코드 스타일을 정의한다. 자동 포맷만으로 판단할 수 없는 구조와 이름을 중심으로 한다.

새 코드와 수정하는 코드부터 이 규칙을 적용한다. 규칙을 맞추기 위한 대규모 일괄 변경은 기능 변경과 섞지 않고 별도 PR로 진행한다.

## 기본 원칙

- 읽는 사람이 성공·실패·상태 전환을 위에서 아래로 따라갈 수 있게 작성한다.
- 프레임워크 진입점은 얇게 유지하고 업무 규칙은 이름 있는 함수와 모듈로 분리한다.
- 같은 사실을 타입, 스키마, 상수에 반복 정의하지 않는다.
- 현재 필요한 추상화만 추가하고, 앱 전용 요구를 공용 패키지로 미리 올리지 않는다.
- 주석은 코드가 무엇을 하는지보다 왜 이 선택을 했는지 설명한다.

## 파일과 이름

| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| 파일·폴더 | kebab-case | `waitlist-email-form.tsx` |
| React 컴포넌트 | PascalCase | `WaitlistEmailForm` |
| 함수·변수 | camelCase | `handleSubscribeWaitlist` |
| 상수 | UPPER_SNAKE_CASE | `REQUEST_FAILED_MESSAGE` |
| 타입·인터페이스 | PascalCase | `WaitlistStore`, `AgeGroup` |
| boolean | `is`, `has`, `can`, `should`로 의미 표현 | `isSaving`, `hasChanges` |
| 이벤트 핸들러 | `handle` 접두사 | `handleSubmit`, `handleOpenChange` |
| 콜백 prop | `on` 접두사 | `onSave`, `onComplete` |

`data`, `item`, `value`, `result`처럼 문맥이 약한 이름은 작은 지역 범위를 벗어나면 구체화한다. 서로 다른 계층에서 같은 개념을 부를 때 이름을 바꾸지 않는다.

## 함수와 컴포넌트

컴포넌트와 내부 함수는 `const`와 화살표 함수를 기본으로 한다.

```tsx
const WaitlistEmailForm = ({ onSubmit }: WaitlistEmailFormProps) => {
  const handleSubmit = async () => {
    // ...
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
};

export default WaitlistEmailForm;
```

- 컴포넌트 모듈은 컴포넌트를 마지막에 기본 export한다.
- 공용 패키지는 배럴 파일에서 이름 있는 API로 다시 export한다.
- Route Handler도 `export const GET/POST/PATCH = async ...` 형태를 사용한다.
- JSX prop 안에 여러 단계의 비동기 처리, validation, 오류 분기를 작성하지 않는다. 이름 있는 핸들러로 분리한다.
- 한 줄 함수라도 도메인 의미가 있거나 재사용되는 경우 이름을 부여한다.
- 조기 반환으로 잘못된 입력과 중복 실행을 먼저 제거한다.

클래스는 `Error` 확장이나 라이브러리가 요구하는 경우처럼 상태와 정체성이 필요한 곳에만 사용한다.

## TypeScript

- `strict` 기준을 유지하고 `any`로 경계를 무력화하지 않는다.
- API 타입은 Zod 스키마에서 `z.infer`로 생성한다. 동일한 DTO interface를 손으로 다시 만들지 않는다.
- 외부 입력과 네트워크 응답은 항상 `unknown`에서 시작해 스키마로 좁힌다.
- 타입만 가져올 때는 `import type` 또는 명명 import의 `type` modifier를 사용한다.
- 여러 문자열 상태는 임의의 `string`보다 literal union을 사용한다.
- non-null assertion보다 입력 검사, 명시적인 기본값, 타입 가드를 우선한다.
- 공개 함수는 반환 타입이 계약을 설명하거나 추론 결과가 불안정할 때 명시한다.

### `undefined`와 `null`

- `undefined`: 아직 선택하거나 전달하지 않은 UI 상태
- `null`: API와 DB에서 명시적으로 값을 비운 상태

UI와 전송 경계에서 변환한다.

```ts
await saveProfile({
  ageGroup: ageGroup ?? null,
  gender: gender ?? null,
});
```

## import와 모듈 경계

import는 다음 그룹 순서로 작성하고 그룹이 길면 빈 줄로 나눈다.

1. React와 Next.js
2. 외부 라이브러리
3. `@checkergie/*` workspace 패키지
4. 앱 절대 경로 (`src/*`)
5. 상대 경로

- 같은 기능 폴더 안에서는 상대 경로를 사용한다.
- 기능 폴더를 넘거나 서버 모듈을 가져올 때는 앱의 `src/*` 별칭을 사용한다.
- 다른 패키지의 내부 파일 경로를 우회하지 않고 `package.json`에 공개된 export를 사용한다.
- Client Component에서 `src/server` 또는 비밀 환경변수를 읽는 모듈을 import하지 않는다.
- 순환 import가 생기면 배럴 파일을 늘리기 전에 책임 배치를 다시 검토한다.

## React

- state는 그것을 변경하는 UI에 가장 가까운 공통 부모가 소유한다.
- 파생 가능한 값은 state로 복제하지 않고 렌더 중 계산한다.
- 서버 요청 상태는 TanStack Query를 기준으로 삼고 동일한 loading/error 상태를 지역 state에 중복 저장하지 않는다.
- 저장 전 편집값과 마지막 저장값처럼 역할이 다른 값은 이름을 분리한다.
- effect는 외부 시스템과 동기화할 때 사용한다. 이벤트 결과는 이벤트 핸들러에서 처리한다.
- render prop이나 callback이 길어지면 컨테이너의 이름 있는 함수로 분리한다.
- 목록 key에는 배열 순서가 아니라 안정적인 식별자를 사용한다.

### Client Component 경계

다음 중 하나가 필요할 때만 `"use client"`를 추가한다.

- `useState`, `useEffect`, `useRef` 등 브라우저 상호작용 상태
- 클릭·입력 등 이벤트 핸들러
- `window`, `document`, Web Storage 같은 브라우저 API
- Client Context provider 또는 클라이언트 전용 라이브러리

Client Component를 import한 상위 파일까지 무조건 client로 바꾸지 않는다. Server Component가 Client Component를 자식으로 렌더링하는 구조를 우선한다.

## Next.js App Router

- 페이지는 `src/app/**/page.tsx`, 레이아웃은 `layout.tsx`, HTTP endpoint는 `route.ts`를 사용한다.
- Metadata API 또는 metadata 파일 규칙을 사용하고 `next/head`를 사용하지 않는다.
- 앱 내 탐색은 `next/link`, 명령형 탐색은 `next/navigation`을 사용한다.
- `params`, `searchParams`, `cookies()`, `headers()`는 Next.js 16 비동기 API로 처리한다.
- Route Handler는 입력 검증, 도메인 호출, HTTP 응답 변환만 담당한다.
- 서버 비밀은 `NEXT_PUBLIC_` 접두사를 붙이지 않는다.

Next.js 동작을 변경하기 전에는 설치된 버전의 `node_modules/next/dist/docs/` 문서를 확인한다.

## API와 오류 처리

- 요청과 응답을 모두 스키마로 검증한다.
- 예상 가능한 도메인 오류는 안정적인 오류 코드로 구분한다.
- 사용자가 고칠 수 있는 입력 문제와 서버 장애를 같은 상태로 처리하지 않는다.
- `catch`로 오류를 비운 채 정상 성공처럼 반환하지 않는다.
- warm-up, analytics처럼 본 기능의 성공 조건이 아닌 best-effort 작업만 실패를 무시할 수 있으며 이유를 이름이나 주석으로 남긴다.
- 사용자 메시지에는 내부 DB 오류와 환경변수 값을 노출하지 않는다.

HTTP와 데이터 계층의 세부 규칙은 [API와 데이터 규칙](./api-and-data.md)을 따른다.

## 스타일과 공용 UI

- 공용 인터랙션은 `@checkergie/ui`를 먼저 확인한다.
- 색상, 타이포그래피, 간격, radius, shadow, z-index, motion은 `cg` semantic token을 우선한다.
- 특정 랜딩 화면에서만 의미가 있는 값은 `--landing-*` 변수로 제한할 수 있다.
- 같은 raw 값이 두 번 이상 반복되면 토큰 또는 variant 후보로 검토한다.
- 긴 Tailwind class와 복합 prop은 한 줄 JSX로 압축하지 않는다. prop을 줄바꿈하고 동작 핸들러를 분리한다.
- 접근성 이름, focus-visible, keyboard, disabled/loading cursor, reduced motion을 함께 검증한다.

구체적인 UI 기준은 [디자인 시스템](./design-system.md)을 따른다.

## 주석과 후속 작업

- 코드만 읽어도 알 수 있는 동작을 한국어로 다시 설명하지 않는다.
- 비정상적으로 보이지만 의도된 trade-off, 외부 제약, 삭제하면 안 되는 이유를 설명한다.
- `추후 수정`만 적은 주석을 남기지 않는다. 실제로 추적해야 하면 이슈를 만들고 PR에 연결한다.
- PR에서 범위를 미룬 결정은 문서의 영구 규칙이 아니라 이슈의 acceptance criteria로 관리한다.

## 검증 체크리스트

변경 범위에 맞는 최소 검사를 실행한다.

```bash
pnpm check       # 랜딩 lint + typecheck + production build
pnpm check:ui    # UI lint + typecheck + Storybook build
```

- API/DB 변경: 개발용 DB 성공·실패 흐름을 별도로 확인
- 공용 UI 변경: 주요 상태를 Storybook에서 직접 확인
- 접근성 변경: 키보드와 focus 흐름 확인
- 환경변수 변경: 로컬, Preview, Production 각각의 설정 위치 확인
