# 브랜치 규칙

## 기본 브랜치

- `main`은 배포 가능한 코드를 관리합니다.
- `develop`은 다음 배포에 포함할 작업을 통합합니다.
- 일반 작업 브랜치는 `develop`에서 생성하고 `develop`으로 병합합니다.
- 배포할 준비가 끝나면 `develop`을 `main`으로 병합합니다.
- `main`과 `develop`에는 직접 커밋하거나 push하지 않습니다.
- `main`에는 강제 push를 허용하지 않습니다.
- `develop`은 긴급 대응을 위해 강제 push를 차단하지 않습니다. 사용한 경우 팀에 변경 내용을 공유합니다.

## 브랜치 이름

브랜치 이름은 `작업 유형/간단한-영문-설명` 형식으로 작성합니다.

| 유형 | 용도 | 예시 |
| --- | --- | --- |
| `feat` | 기능 추가 | `feat/landing-hero` |
| `fix` | 오류 수정 | `fix/form-submit` |
| `refactor` | 기능 변화 없는 구조 개선 | `refactor/api-client` |
| `chore` | 설정 및 환경 작업 | `chore/monorepo-setup` |
| `docs` | 문서 작업 | `docs/git-rule` |

## 작업 흐름

1. 최신 `develop`을 기준으로 작업 브랜치를 만듭니다.
2. 한 브랜치에서는 한 가지 목적의 작업만 진행합니다.
3. 작업 중에도 `lint`, `typecheck`, `build`를 확인합니다.
4. 검토가 끝난 변경은 `develop`으로 squash merge합니다.
5. 병합된 작업 브랜치는 삭제합니다.
6. 배포 시 `develop`을 `main`으로 병합합니다.
