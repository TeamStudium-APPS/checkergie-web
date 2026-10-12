# 기술 문서 안내

이 디렉터리는 Checkergie Web의 아키텍처, 구현 규칙, 협업 기준을 관리한다. 서비스 화면에 노출하는 이용약관과 개인정보처리방침 원문은 `packages/docs`에서 관리하며, 이 디렉터리의 개발 문서와 역할이 다르다.

## 문서 지도

| 문서 | 기준으로 삼는 내용 |
| --- | --- |
| [architecture.md](./architecture.md) | 모노레포 경계, 앱과 패키지의 책임, 런타임 경계, 의존 방향 |
| [code-convention.md](./code-convention.md) | TypeScript, React, Next.js, 네이밍, 함수와 컴포넌트 작성 규칙 |
| [api-and-data.md](./api-and-data.md) | API 계약, 상태 관리, 오류, 환경변수, DB와 대기 등록 흐름 |
| [design-system.md](./design-system.md) | 공용 UI, 토큰, Atomic Design, Storybook 기준 |
| [git-convention.md](./git-convention.md) | 커밋 메시지와 저장소 관리 규칙 |
| [branch-convention.md](./branch-convention.md) | 브랜치 이름과 기본 작업 흐름 |
| [git-project-workflow.md](./git-project-workflow.md) | 이슈, PR, 프로젝트 상태 연결 규칙 |
| [skill-convention.md](./skill-convention.md) | 프로젝트 전용 에이전트 스킬 관리 규칙 |

## 문서 적용 순서

서로 겹치는 내용은 다음 순서로 판단한다.

1. `AGENTS.md`와 실제 CI·설정 파일
2. 특정 영역 문서 (`design-system.md`, `api-and-data.md`)
3. 전체 구조와 일반 코드 규칙 (`architecture.md`, `code-convention.md`)
4. 개별 코드의 설명 주석

문서와 구현이 다르면 구현을 그대로 정답으로 가정하지 않는다. 의도된 변경인지 확인한 뒤 구현 또는 문서를 같은 PR에서 함께 고친다.

## 갱신 기준

다음 변경에는 관련 문서 갱신을 포함한다.

- 앱이나 워크스페이스 패키지를 추가하거나 책임을 이동할 때
- API 응답, 오류 코드, 환경변수 또는 DB 스키마를 바꿀 때
- 공용 상태 관리나 컴포넌트 작성 방식에 새 기준을 도입할 때
- 반복되는 리뷰 의견을 팀 규칙으로 확정할 때

일시적인 작업 메모나 담당자 정보는 이 문서에 남기지 않고 이슈와 PR에서 관리한다.
