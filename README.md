# Checkergie Web

Checkergie의 랜딩 페이지와 관리자 페이지를 관리하는 pnpm workspace입니다.

## 구조

```text
apps/
  landing/     랜딩 페이지
  admin/       관리자 페이지
packages/
  ui/          공통 UI
  api/         API 통신 및 데이터 검증
docs/          협업 문서
```

각 프로젝트의 소스 코드는 `src/`에 작성하며 `src/*` 별칭으로 접근합니다.

```ts
import Example from "src/components/Example";
```

## 시작하기

- Node.js 24.14.0 (`.nvmrc` 참고)
- pnpm 11.9.0

```bash
pnpm install
pnpm dev
```

랜딩 페이지는 http://localhost:3000 에서 실행됩니다.

## 검사

```bash
pnpm check
```

`pnpm check`는 현재 구현된 랜딩 앱의 lint, typecheck, production build를 순서대로 실행합니다.

협업 규칙은 [Git 규칙](./docs/git-convention.md)과 [브랜치 규칙](./docs/branch-convention.md)을 확인해주세요.
